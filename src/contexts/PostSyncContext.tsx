import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { PostProps } from "../Components/Feed/Post2";
import { useAuth } from "../Components/AuthContext";
import { fetchPost, fetchPosts } from "../api";
import { useLocation } from "react-router-dom";

type ContextPostProps = PostProps & {
  parent_post?: PostProps;
};
// id → post original (chiar dacă e quote sau repost)
type PostMap = Record<number, ContextPostProps>;
type LinkMap = Record<number, number[]>;
// id → lista de id-uri care reprezintă instanțele (reposturi)
type State = {
  posts: PostMap;
  links: LinkMap;
};

type Action =
  | { type: "INIT"; payload: State }
  | { type: "REGISTER"; post: PostProps }
  | { type: "UPDATE"; id: number; data: Partial<PostProps> }
  | { type: "UNREGISTER"; id: number };

function reducer(state: State, action: Action): State {
  let newState: State = state;
  // console.log("[PostSync Reducer] Action:", action);
  switch (action.type) {
    case "INIT": {
      newState = action.payload;
      console.log(`[PostSync Reducer] After ${action.type}:`, newState);
      break;
    }

    case "REGISTER": {
      const post = action.post;
      const posts = { ...state.posts, [post.id]: post };
      const links = { ...state.links };
      // console.log(
      //   "[Reducer REGISTER] id:",
      //   post.id,
      //   "type:",
      //   post.type,
      //   "parent:",
      //   post.parent,
      //   "post:",
      //   post
      // );

      if (post.parent !== null && post.parent !== undefined) {
        const arr = links[post.parent] || [];
        if (!arr.includes(post.id)) {
          links[post.parent] = [...arr, post.id];
        }
      }
      newState = { posts, links };
      console.log(`[PostSync Reducer] After ${action.type}:`, newState);
      break;
    }

    case "UPDATE": {
      if (!action.data) {
        newState = state;
        console.log(`[PostSync Reducer] After ${action.type}:`, newState);
        break;
      }
      const existing = state.posts[action.id];
      if (!existing) {
        newState = state;
        console.log(`[PostSync Reducer] After ${action.type}:`, newState);
        break;
      }
      const SKIP_SYNC_KEYS = [
        "id",
        "type",
        "parent",
        "created_at",
        "username",
        "display_name",
        "avatar_url",
      ];
      // filtrăm undefined și excludem id-ul ca să nu-l propagăm copiilor
      const filtered = Object.fromEntries(
        Object.entries(action.data).filter(
          ([key, value]) => value !== undefined && !SKIP_SYNC_KEYS.includes(key)
        )
      );

      // actualizăm părinte cu toate câmpurile primite
      const mergedParent = { ...existing, ...filtered };
      const posts = { ...state.posts, [action.id]: mergedParent };

      // propagăm câmpurile și nested parent_post către repost-uri
      for (const childId of state.links[action.id] || []) {
        const child = posts[childId];
        if (child && child.type === "repost") {
          posts[childId] = {
            ...child,
            ...filtered,
            parent_post: mergedParent,
          };
        }
      }

      newState = { ...state, posts };
      console.log(`[PostSync Reducer] After ${action.type}:`, newState);

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

      // curățăm referințele orfane
      for (const key of Object.keys(links)) {
        links[+key] = links[+key].filter((cid) => cid !== action.id);
      }
      newState = { posts, links };
      console.log(`[PostSync Reducer] After ${action.type}:`, newState);
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
  replaceWithFeed: (posts: PostProps[], links: LinkMap) => void;
  replaceWithPostDetail: (data: {
    post: PostProps;
    replies: PostProps[];
    links: LinkMap;
  }) => void;
  replaceWithProfile: (posts: PostProps[], links: LinkMap) => void;
}>({
  state: { posts: {}, links: {} },
  registerPost: () => {},
  updatePost: () => {},
  unregisterPost: () => {},
  replaceWithFeed: () => {},
  replaceWithPostDetail: () => {},
  replaceWithProfile: () => {},
});

export const usePostSyncContext = () => useContext(PostSyncContext);

export const PostSyncProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, { posts: {}, links: {} });
  const onNewPostRef = useRef<((post: PostProps) => void) | null>(null);
  const setOnNewPost = (cb: (post: PostProps) => void) => {
    onNewPostRef.current = cb;
  };
  const { token, isReady } = useAuth();
  const location = useLocation();
  // 2. Real-time sync via WebSocket
  useEffect(() => {
    if (!token || !isReady) return;

    const ws = new WebSocket("ws://localhost:8000/ws/posts/");
    ws.onopen = () => console.log("✅ WS opened");
    ws.onclose = () => console.log("❌ WS closed");
    ws.onerror = (e) => {
      console.error("🛑 WS error", e);
      ws.close();
    };

    ws.onmessage = (e) => {
      let msg: { type: string; data: PostProps };
      try {
        msg = JSON.parse(e.data);
        console.log("WS MSG:", msg.type, msg.data);
      } catch (err) {
        console.error("WS parse error", err);
        return;
      }
      const { type, data } = msg;

      switch (type) {
        case "post_create":
          if (
            (data.type === "repost" ||
              data.type === "quote" ||
              data.type === "reply") &&
            data.parent &&
            !(state.posts && state.posts[data.parent])
          ) {
            fetchPost(data.parent).then((res) => {
              dispatch({ type: "REGISTER", post: res.data });
            });
          }
          dispatch({ type: "REGISTER", post: data });
          onNewPostRef.current?.(data);
          break;

        case "post_update":
          dispatch({ type: "UPDATE", id: data.id, data });
          break;

        case "post_user_update":
          dispatch({
            type: "UPDATE",
            id: data.id,
            data: {
              liked_by_user: data.liked_by_user,
              reposted_by_user: data.reposted_by_user,
            },
          });
          break;

        case "post_delete":
          dispatch({ type: "UNREGISTER", id: data.id });
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, [token, isReady]);

  const registerPost = useCallback((post: PostProps) => {
    dispatch({ type: "REGISTER", post });
    onNewPostRef.current?.(post);
  }, []);

  const updatePost = (id: number, data: Partial<PostProps>) =>
    dispatch({ type: "UPDATE", id, data });

  const unregisterPost = useCallback((id: number) => {
    dispatch({ type: "UNREGISTER", id });
  }, []);

  const replaceWithFeed = useCallback((posts: PostProps[], links: LinkMap) => {
    const postMap: Record<number, PostProps> = {};
    posts.forEach((p) => {
      postMap[p.id] = p;
    });
    dispatch({ type: "INIT", payload: { posts: postMap, links } });
  }, []);

  const replaceWithPostDetail = useCallback(
    ({
      post,
      replies,
      links,
    }: {
      post: PostProps;
      replies: PostProps[];
      links: LinkMap;
    }) => {
      const postMap: Record<number, PostProps> = { [post.id]: post };
      replies.forEach((r) => {
        postMap[r.id] = r;
      });
      dispatch({ type: "INIT", payload: { posts: postMap, links } });
    },
    []
  );
  const replaceWithProfile = useCallback(
    (posts: PostProps[], links: LinkMap) => {
      const postMap: Record<number, PostProps> = {};
      posts.forEach((p) => {
        postMap[p.id] = p;
      });
      dispatch({ type: "INIT", payload: { posts: postMap, links } });
    },
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
        replaceWithFeed,
        replaceWithPostDetail,
        replaceWithProfile,
      }}
    >
      {children}
    </PostSyncContext.Provider>
  );
};
