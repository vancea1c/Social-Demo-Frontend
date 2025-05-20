import { useMemo } from "react";
import { usePostSyncContext } from "../contexts/PostSyncContext";
import type { PostProps } from "./Feed/Post2";

export function usePostSync(initial: PostProps) {
  const { state, updatePost } = usePostSyncContext();

  const post = useMemo(
    () => ({
      ...initial,
      ...(state.posts[initial.id] ?? {}),
    }),
    [state.posts, initial]
  );

  return {
    post,
    setPost: (data: Partial<PostProps>) => updatePost(initial.id, data),
  };
}
