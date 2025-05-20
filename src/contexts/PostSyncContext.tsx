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
import { fetchPosts } from "../api";

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

  switch (action.type) {
    case "INIT": {
      newState = action.payload;
      break;
    }

    case "REGISTER": {
      const post = action.post;
      const posts = { ...state.posts, [post.id]: post };
      const links = { ...state.links };

      // dacă e repost, legăm copy-ul la parent
      if (post.type === "repost" && post.parent != null) {
        const parentId = post.parent;
        const arr = links[parentId] || [];
        if (!arr.includes(post.id)) {
          links[parentId] = [...arr, post.id];
        }
      }

      newState = { posts, links };
      break;
    }

    case "UPDATE": {
      if (!action.data) {
        newState = state;
        break;
      }
      const existing = state.posts[action.id];
      if (!existing) {
        newState = state;
        break;
      }

      // filtrăm undefined și excludem id-ul ca să nu-l propagăm copiilor
      const filtered = Object.fromEntries(
        Object.entries(action.data).filter(
          ([key, value]) => value !== undefined && key !== "id"
        )
      );

      // actualizăm părinte cu toate câmpurile primite
      const mergedParent: PostProps = { ...existing, ...filtered };
      const posts = { ...state.posts, [action.id]: mergedParent };

      // propagăm câmpurile și nested parent_post către repost-uri
      for (const childId of state.links[action.id] || []) {
        const child = posts[childId];
        if (child) {
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

      // curățăm referințele orfane
      for (const key of Object.keys(links)) {
        links[+key] = links[+key].filter((cid) => cid !== action.id);
      }

      newState = { posts, links };
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
  setOnNewPost?: (fn: (post: PostProps) => void) => void;
}>({
  state: { posts: {}, links: {} },
  registerPost: () => {},
  updatePost: () => {},
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

  // 1. FETCH INIȚIAL LA MONTARE (bulk INIT)
  useEffect(() => {
    if (!token || !isReady) return;

    fetchPosts().then((response) => {
      const data: PostProps[] = Array.isArray(response.data)
        ? response.data
        : response.data.results;

      const posts: Record<number, PostProps> = {};
      const links: Record<number, number[]> = {};

      data.forEach((p) => {
        posts[p.id] = p;
        if (p.type === "repost" && p.parent != null) {
          links[p.parent] = [...(links[p.parent] || []), p.id];
        }
      });

      dispatch({ type: "INIT", payload: { posts, links } });
    });
  }, [token, isReady]);

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
      try {
        const { type, data } = JSON.parse(e.data);
        console.log("WS MSG:", type, data);

        switch (type) {
          case "post_create":
            dispatch({ type: "REGISTER", post: data });
            onNewPostRef.current?.(data);
            break;

          case "post_update":
            if (
              data.parent_post &&
              typeof data.parent_post === "object" &&
              data.parent_post.id
            ) {
              dispatch({
                type: "UPDATE",
                id: data.parent_post.id,
                data: data.parent_post,
              });
            } else if (data.id) {
              dispatch({ type: "UPDATE", id: data.id, data });
            }
            break;

          case "post_delete":
            dispatch({ type: "UNREGISTER", id: data.id });
            break;
        }
      } catch (err) {
        console.error("WS parse error", err);
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

  return (
    <PostSyncContext.Provider
      value={{ state, registerPost, updatePost, setOnNewPost }}
    >
      {children}
    </PostSyncContext.Provider>
  );
};
