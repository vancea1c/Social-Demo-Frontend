import { useCallback } from "react";
import { repostPost } from "../api";
import { usePostSync } from "./usePostSync"; 
import type { PostProps } from "../Components/Feed/Post2";

export function useToggleRepost(initial: PostProps) {
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
