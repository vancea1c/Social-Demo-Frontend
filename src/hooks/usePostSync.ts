import { useMemo } from "react";
import { usePostSyncContext } from "../contexts/PostSyncContext";
import type { PostProps } from "../Components/Feed/Post2";

export function usePostSync(initial: PostProps) {
  const {
    state,
    registerPost,
    updatePost,
    unregisterPost,
    registerLike,
    unregisterLike,
  } = usePostSyncContext();

  const post = useMemo(
    () => ({
      ...initial,
      ...(state.posts[initial.id] ?? {}),
    }),
    [state.posts, initial]
  );

  return {
    post,
    registerPost,
    updatePost: (data: Partial<PostProps>) => updatePost(initial.id, data),
    unregisterPost: () => unregisterPost(initial.id),
    registerLike: () => registerLike(post),
    unregisterLike: () => unregisterLike(initial.id),
  };
}
