// src/contexts/PostSyncContext.tsx
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

// id → post original (chiar dacă e quote sau repost)
type PostMap = Record<number, PostProps>;
// id → lista de id-uri care reprezintă instanțele (reposturi)
type LinkMap = Record<number, number[]>;

type State = {
  posts: PostMap;
  links: LinkMap;
};

type Action =
  | { type: "REGISTER"; post: PostProps }
  | { type: "UPDATE"; id: number; data: Partial<PostProps> }
  | { type: "UNREGISTER"; id: number };

function reducer(state: State, action: Action): State {
  if (["REGISTER", "UPDATE", "UNREGISTER"].includes(action.type)) {
    console.log("[PostSync] REDUCER ACTION:", action.type, action);
  }
  if (action.type === "UPDATE") {
    console.log("=== DEBUG UPDATE:", action);
  }
  let newState: State = state;
  switch (action.type) {
    case "REGISTER": {
      const post = action.post;
      const posts = { ...state.posts, [post.id]: post };
      if (
        state.posts[post.id] &&
        JSON.stringify(state.posts[post.id]) === JSON.stringify(post)
      ) {
        newState = state;
        break;
      }
      let links = { ...state.links };
      if (post.parent !== null && post.parent !== undefined) {
        links[post.parent] = [...(links[post.parent] || []), post.id];
      }
      newState = { posts, links };
      break;
    }

    case "UPDATE": {
      if (!action.data) {
        console.warn("Primit UPDATE cu data undefined/null! Ignorăm.", action);
        console.trace("TRACE pentru UPDATE cu undefined");
        return state;
      }
      const existing = state.posts[action.id];
      console.log("UPDATE PAYLOAD:", action.data, "EXISTING:", existing);
      if (!existing) {
        newState = state;
        break;
      }
      const filtered = Object.fromEntries(
        Object.entries(action.data).filter(([k, v]) => v !== undefined)
      );
      const merged: PostProps = { ...existing, ...filtered };
      const posts = { ...state.posts, [action.id]: merged };
      for (const childId of state.links[action.id] || []) {
        if (posts[childId]) {
          posts[childId] = { ...posts[childId], ...action.data };
        } else {
          console.warn(
            "Reducer: încercare update pe childId inexistent",
            childId,
            action
          );
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

      // Curăță și orice apariție a acestui id ca "copil" în links (evită referințe orfane)
      Object.keys(links).forEach((key) => {
        links[+key] = links[+key].filter((id) => id !== action.id);
      });
      console.log("DUPĂ UNREGISTER, posts:", posts, "links:", links);
      newState = { ...state, posts, links };
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
  const [state, dispatch] = useReducer(reducer, {
    posts: {},
    links: {},
  });
  const onNewPostRef = useRef<((post: PostProps) => void) | null>(null);
  const setOnNewPost = (cb: (post: PostProps) => void) => {
    onNewPostRef.current = cb;
  };
  const { token, isReady } = useAuth();

  // 1. FETCH INIȚIAL LA MONTARE (DOAR O SINGURĂ DATĂ)
  useEffect(() => {
    if (!token || !isReady) return;

    fetchPosts().then((response) => {
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results;
      console.log(
        "[PostSync] FETCHED POSTS INIT:",
        data.length,
        "posts loaded."
      );
      data.forEach((post) => {
        dispatch({ type: "REGISTER", post });
        // Adaugă un log aici!
        console.log("După REGISTER, links:", state.links);
      });
    });
  }, [token, isReady]);

  // 2. SINCRONIZARE REALTIME PRIN WEBSOCKET
  useEffect(() => {
    if (!token || !isReady) return;

    const ws = new WebSocket("ws://localhost:8000/ws/posts/");
    ws.onopen = () => console.log("✅ WS opened");
    ws.onclose = () => console.log("❌ WS closed");
    ws.onerror = (e) => {
      console.error("🛑 WS error", e);
      ws.close(); // 👈 previne reconectări dubioase
    };

    ws.onmessage = (e) => {
      try {
        const message = JSON.parse(e.data);
        if (typeof message !== "object") {
          console.warn("WS primit non-object:", e.data);
        }
        if (!message.data) {
          console.warn("WS primit fără data:", message, e.data);
        }
        console.log("WS MSG:", message);
        message.type = "post_create", "post_update", "post_delete";
        if (!message.type) return;

        switch (message.type) {
          case "post_create":
            if (!message.data) {
              console.warn("WS post_create fără data! 1Ignor.", message);
              return;
            }
            dispatch({ type: "REGISTER", post: message.data });
            break;

          case "post_update":
            if (!message.data) {
              console.warn("WS post_update fără data! Ignor.", message);
              return;
            }
            if (
              message.data.parent_post &&
              typeof message.data.parent_post === "object"
            ) {
              dispatch({
                type: "UPDATE",
                id: message.data.parent_post.id,
                data: message.data.parent_post,
              });
            } else if (message.data.id) {
              dispatch({
                type: "UPDATE",
                id: message.data.id,
                data: message.data,
              });
            } else {
              console.warn("post_update fără payload valid!", message);
            }
            break;
          case "post_delete":
            if (!message.data || !message.data.id) {
              console.warn("WS post_delete fără id! Ignor.", message);
              return;
            }
            dispatch({ type: "UNREGISTER", id: message.data.id });
            break;
          default:
            // ignoră orice alt tip de mesaj
            break;
        }
      } catch (err) {
        console.error("WS JSON.parse error", e.data, err);
      }
    };

    return () => {
      console.log("🧹 Cleaning up WS");
      ws.close();
    };
  }, [token, isReady]);

  const registerPost = useCallback((post: PostProps) => {
    dispatch({ type: "REGISTER", post });
    console.log("registerPost", post);
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