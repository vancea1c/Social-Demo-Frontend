import React, { useEffect, useMemo } from "react";
import PostInput from "./PostInput";
import Post, { PostProps } from "./Post2";
import { usePostSyncContext } from "../../contexts/PostSyncContext";

// Sortare descrescător după dată
const sortByDate = (a: PostProps, b: PostProps) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

// Elimină duplicate (uneori pot apărea copii cu același id+type din cauza sincronizărilor)
function deduplicatePosts(posts: PostProps[]) {
  const map = new Map<string, PostProps>();
  for (const p of posts) {
    map.set(`${p.type}-${p.id}`, p);
  }
  const arr = Array.from(map.values()).sort(sortByDate);
  return arr;
}

const Feed: React.FC = () => {
  const { state } = usePostSyncContext();

  const posts = useMemo(
    () =>
      deduplicatePosts(
        Object.values(state.posts).filter(
          (p) => p.type === "post" || p.type === "repost" || p.type === "quote"
        )
      ),

    [state.posts]
  );
  return (
    <main>
      <PostInput />
      {posts.map((p) =>
        p && typeof p.id === "number" ? (
          <Post key={`${p.type}-${p.id}`} {...p} />
        ) : null
      )}
      <div style={{ height: "50vh" }} />
    </main>
  );
};

export default Feed;
