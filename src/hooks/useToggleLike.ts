import { useCallback } from "react";
import { likePost, unlikePost } from "../api";
import { usePostSync } from "./usePostSync";
import type { PostProps } from "../Components/Feed/Post2";

export function useToggleLike(initial: PostProps) {
  const { post, updatePost, registerLike, unregisterLike } =
    usePostSync(initial);

  const toggle = useCallback(async () => {
    try {
      const res = post.liked_by_user
        ? await unlikePost(post.id)
        : await likePost(post.id);

      const { liked_by_user, likes_count } = res;

      updatePost({ liked_by_user, likes_count });
      if (liked_by_user) registerLike();
      else unregisterLike();
    } catch (err) {
      console.error("Eroare la toggle like:", err);
    }
  }, [post, updatePost, registerLike, unregisterLike]);

  return {
    liked: post.liked_by_user,
    count: post.likes_count,
    toggle,
  };
}
