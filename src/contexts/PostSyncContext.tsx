// src/contexts/PostSyncContext.tsx
import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useRef,
} from "react";
import type { PostProps } from "../Components/Feed/Post2";
import { useAuth } from "../Components/AuthContext";

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
  | { type: "UPDATE"; id: number; data: Partial<PostProps> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "REGISTER": {
      const post = action.post;
      if (state.posts[post.id]) return state;

      const isChild = post.type === "repost";
      const targetId = isChild ? post.parent! : post.id;

      return {
        posts: {
          ...state.posts,
          [post.id]: post,
        },
        links: isChild
          ? {
              ...state.links,
              [targetId]: [...(state.links[targetId] || []), post.id],
            }
          : state.links,
      };
    }

    case "UPDATE": {
      if (!state.posts[action.id]) return state;
      const { type: _evt, ...fields } = action.data as any;
      const newPost = { ...state.posts[action.id], ...fields };
      const linkedIds = state.links[action.id] || [];
      const updatedPosts = { ...state.posts, [action.id]: newPost };

      for (const id of linkedIds) {
        updatedPosts[id] = { ...updatedPosts[id], ...action.data };
      }

      return {
        ...state,
        posts: updatedPosts,
      };
    }
  }
}

const PostSyncContext = createContext<{
  state: State;
  registerPost: (post: PostProps) => void;
  updatePost: (id: number, data: Partial<PostProps>) => void;
  onNewPost?: (post: PostProps) => void;
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
      const data = JSON.parse(e.data);

      if (data.type === "post_update") {
        dispatch({ type: "UPDATE", id: data.id, data });
      } else if (data.type === "post_create") {
        // verificăm că e un repost, quote, etc.
        dispatch({ type: "REGISTER", post: data });
        onNewPostRef.current?.(data);
      }
    };

    return () => {
      console.log("🧹 Cleaning up WS");
      ws.close();
    };
  }, [token, isReady]);

  const registerPost = (post: PostProps) => {
    dispatch({ type: "REGISTER", post });
    onNewPostRef.current?.(post);
  };
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
