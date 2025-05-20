// src/hooks/useToggleRepost.ts
import { useCallback } from "react";
import { repostPost } from "../api";
import { usePostSync } from "./usePostSync"; // <-- note the hook import
import type { PostProps } from "../Components/Feed/Post2";

export function useToggleRepost(initial: PostProps) {
  // register & keep in sync
  const { post } = usePostSync(initial);

  const toggle = useCallback(async () => {
    try {
      await repostPost(post.id);
    } catch (err) {
      console.error("Eroare la toggle repost:", err);
    }
  }, [post.id]);

  return {
    reposted: post.reposted_by_user,
    count: post.reposts_count,
    toggle,
  };
}
