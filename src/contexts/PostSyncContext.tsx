import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { PostProps } from "../Components/Feed/Post2";
import { useAuth } from "./AuthContext";
import { fetchPost } from "../api";
import { useWebsocket } from "./WebSocketContext";

type ContextPostProps = PostProps & {
  parent_post?: PostProps;
};

type PostMap = Record<number, ContextPostProps>;
type LinkMap = Record<number, number[]>;

type State = {
  posts: PostMap;
  links: LinkMap;
  liked: PostMap;
};

type Action =
  | { type: "INIT"; payload: { posts: PostProps[]; links: LinkMap } }
  | { type: "REGISTER"; post: PostProps }
  | { type: "UPDATE"; id: number; data: Partial<PostProps> }
  | { type: "UNREGISTER"; id: number }
  | { type: "INIT_LIKES"; payload: { posts: PostProps[] } }
  | { type: "REGISTER_LIKE"; post: PostProps }
  | { type: "UNREGISTER_LIKE"; id: number };

const initialState: State = {
  posts: {},
  links: {},
  liked: {},
};

function reducer(state: State, action: Action): State {
  let newState = state;
  switch (action.type) {
    case "INIT": {
      const posts: PostMap = {};
      action.payload.posts.forEach((p) => (posts[p.id] = p));
      newState = { ...state, posts, links: action.payload.links };
      break;
    }

    case "REGISTER": {
      const post = action.post;
      const posts = { ...state.posts, [post.id]: post };
      const links = { ...state.links };

      if (post.parent !== null && post.parent !== undefined) {
        const arr = links[post.parent] || [];
        if (!arr.includes(post.id)) {
          links[post.parent] = [...arr, post.id];
        }
      }

      newState = { ...state, posts, links };
      break;
    }

    case "UPDATE": {
      if (!action.data) return state;

      const existing = state.posts[action.id];
      if (!existing) return state;

      const SKIP_KEYS = [
        "id",
        "type",
        "parent",
        "created_at",
        "username",
        "display_name",
        "avatar_url",
      ];

      const filtered = Object.fromEntries(
        Object.entries(action.data).filter(
          ([key, val]) => val !== undefined && !SKIP_KEYS.includes(key)
        )
      );

      const mergedParent = { ...existing, ...filtered };
      const posts = { ...state.posts, [action.id]: mergedParent };

      for (const childId of state.links[action.id] || []) {
        const child = posts[childId];
        if (child?.type === "repost") {
          posts[childId] = {
            ...child,
            ...filtered,
            parent_post: mergedParent,
          };
        }
      }

      newState = { ...state, posts };
      break;
    }

    case "UNREGISTER": {
      const posts = { ...state.posts };
      const links = { ...state.links };

      function deleteWithChildren(id: number) {
        if (links[id]) {
          for (const childId of links[id]) {
            deleteWithChildren(childId);
          }
          delete links[id];
        }
        delete posts[id];
      }

      deleteWithChildren(action.id);

      for (const key of Object.keys(links)) {
        links[+key] = links[+key].filter((cid) => cid !== action.id);
      }

      newState = { ...state, posts, links };
      break;
    }
    case "INIT_LIKES": {
      const liked: PostMap = {};
      action.payload.posts.forEach((p) => (liked[p.id] = p));
      newState = { ...state, liked };
      break;
    }
    case "REGISTER_LIKE": {
      const post = action.post;
      newState = { ...state, liked: { ...state.liked, [post.id]: post } };
      break;
    }
    case "UNREGISTER_LIKE": {
      const liked = { ...state.liked };
      delete liked[action.id];
      newState = { ...state, liked };
      break;
    }

    default:
      newState = state;
  }

  return newState;
}

const PostSyncContext = createContext<{
  state: State;
  registerPost: (post: PostProps) => void;
  updatePost: (id: number, data: Partial<PostProps>) => void;
  unregisterPost: (id: number) => void;
  setOnNewPost?: (fn: (post: PostProps) => void) => void;

  registerLike: (post: PostProps) => void;
  unregisterLike: (id: number) => void;

  replaceWithFeed: (posts: PostProps[], links: LinkMap) => void;
  replaceWithPostDetail: (data: {
    post: PostProps;
    replies: PostProps[];
    links: LinkMap;
  }) => void;
  replaceWithProfile: (posts: PostProps[], links: LinkMap) => void;
  replaceWithLikes: (posts: PostProps[]) => void;
}>({
  state: initialState,
  registerPost: () => {},
  updatePost: () => {},
  unregisterPost: () => {},
  registerLike: () => {},
  unregisterLike: () => {},
  replaceWithFeed: () => {},
  replaceWithPostDetail: () => {},
  replaceWithProfile: () => {},
  replaceWithLikes: () => {},
});

export const usePostSyncContext = () => useContext(PostSyncContext);

export const PostSyncProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const onNewPostRef = useRef<((post: PostProps) => void) | null>(null);
  const { token, isReady } = useAuth();
  const { subscribe, unsubscribe } = useWebsocket();

  const setOnNewPost = (cb: (post: PostProps) => void) => {
    onNewPostRef.current = cb;
  };

  useEffect(() => {
    if (!token || !isReady) return;

    const handleCreate = (data: PostProps) => {
      if (
        (data.type === "repost" ||
          data.type === "quote" ||
          data.type === "reply") &&
        data.parent &&
        !state.posts[data.parent]
      ) {
        fetchPost(data.parent).then((res) => {
          dispatch({ type: "REGISTER", post: res.data });
        });
      }
      dispatch({ type: "REGISTER", post: data });
      onNewPostRef.current?.(data);
    };

    const handleUpdate = (data: PostProps) =>
      dispatch({ type: "UPDATE", id: data.id, data });

    const handleUserUpdate = (data: PostProps) => {
      dispatch({
        type: "UPDATE",
        id: data.id,
        data: {
          liked_by_user: data.liked_by_user,
          reposted_by_user: data.reposted_by_user,
        },
      });
      if (data.liked_by_user) {
        dispatch({ type: "REGISTER_LIKE", post: data });
      } else {
        dispatch({ type: "UNREGISTER_LIKE", id: data.id });
      }
    };

    const handleDelete = (data: { id: number }) =>
      dispatch({ type: "UNREGISTER", id: data.id });

    subscribe("post_create", handleCreate);
    subscribe("post_update", handleUpdate);
    subscribe("post_user_update", handleUserUpdate);
    subscribe("post_delete", handleDelete);

    return () => {
      unsubscribe("post_create", handleCreate);
      unsubscribe("post_update", handleUpdate);
      unsubscribe("post_user_update", handleUserUpdate);
      unsubscribe("post_delete", handleDelete);
    };
  }, [token, isReady, state.posts, subscribe, unsubscribe]);

  const registerPost = useCallback((post: PostProps) => {
    dispatch({ type: "REGISTER", post });
    onNewPostRef.current?.(post);
  }, []);

  const updatePost = (id: number, data: Partial<PostProps>) =>
    dispatch({ type: "UPDATE", id, data });

  const unregisterPost = useCallback((id: number) => {
    dispatch({ type: "UNREGISTER", id });
  }, []);

  const registerLike = (post: PostProps) =>
    dispatch({ type: "REGISTER_LIKE", post });
  const unregisterLike = (id: number) =>
    dispatch({ type: "UNREGISTER_LIKE", id });

  const replaceWithFeed = useCallback((posts: PostProps[], links: LinkMap) => {
    dispatch({ type: "INIT", payload: { posts, links } });
  }, []);

  const replaceWithPostDetail = useCallback(
    (payload: { post: PostProps; replies: PostProps[]; links: LinkMap }) => {
      dispatch({
        type: "INIT",
        payload: {
          posts: [payload.post, ...payload.replies],
          links: payload.links,
        },
      });
    },
    []
  );

  const replaceWithProfile = useCallback(
    (posts: PostProps[], links: LinkMap) => {
      dispatch({ type: "INIT", payload: { posts, links } });
    },
    []
  );

  const replaceWithLikes = useCallback(
    (posts: PostProps[]) =>
      dispatch({ type: "INIT_LIKES", payload: { posts } }),
    []
  );
  return (
    <PostSyncContext.Provider
      value={{
        state,
        registerPost,
        updatePost,
        unregisterPost,
        setOnNewPost,
        registerLike,
        unregisterLike,
        replaceWithFeed,
        replaceWithPostDetail,
        replaceWithProfile,
        replaceWithLikes,
      }}
    >
      {children}
    </PostSyncContext.Provider>
  );
};
