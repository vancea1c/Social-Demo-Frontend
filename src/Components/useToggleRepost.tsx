// src/hooks/useToggleRepost.ts
import { useCallback } from "react";
import { repostPost } from "../api";
import { usePostSync } from "./usePostSync"; // <-- note the hook import
import type { PostProps } from "../Components/Feed/Post2";

export function useToggleRepost(initial: PostProps) {
  // register & keep in sync
  const { post, setPost } = usePostSync(initial);

  const toggle = useCallback(async () => {
    try {
      const res = await repostPost(post.id);
      setPost({
        reposted_by_user: res.data.reposted_by_user,
        reposts_count: res.data.reposts_count,
      });
    } catch (err) {
      console.error("Eroare la toggle repost:", err);
    }
  }, [post, setPost]);

  return {
    reposted: post.reposted_by_user,
    count: post.reposts_count,
    toggle,
  };
}
