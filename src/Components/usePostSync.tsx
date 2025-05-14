// src/hooks/usePostSync.ts
import { useEffect, useRef } from "react";
import { usePostSyncContext } from "../contexts/PostSyncContext";
import type { PostProps } from "./Feed/Post2";

export function usePostSync(initial: PostProps) {
  const { state, registerPost, updatePost } = usePostSyncContext();
  const stableInitial = useRef(initial);

  useEffect(() => {
    registerPost(stableInitial.current);
  }, []);

  const post = {
    ...stableInitial.current,
    ...(state.posts[initial.id] ?? {}),
  };

  return {
    post,
    setPost: (data: Partial<PostProps>) => updatePost(initial.id, data),
  };
}
