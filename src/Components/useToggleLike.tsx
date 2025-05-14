// src/hooks/useToggleLike.ts
import { useCallback } from "react";
import api from "../api";
import { usePostSync } from "./usePostSync";
import type { PostProps } from "../Components/Feed/Post2";

export function useToggleLike(initial: PostProps) {
  // înregistrează și sincronizează post-ul
  const { post, setPost } = usePostSync(initial);

  const toggle = useCallback(async () => {
    const url = `/posts/${post.id}/like/`;
    try {
      const res = post.liked_by_user
        ? await api.delete(url)
        : await api.post(url);

      setPost({
        liked_by_user: res.data.liked_by_user,
        likes_count:   res.data.likes_count,
      });
    } catch (err) {
      console.error("Eroare la toggle like:", err);
    }
  }, [post, setPost]);

  return {
    liked: post.liked_by_user,
    count: post.likes_count,
    toggle,
  };
}
