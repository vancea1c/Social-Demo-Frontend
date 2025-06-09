import React, { useEffect } from "react";
import PostInput from "./PostInput";
import Post, { PostProps } from "./Post2";
import { usePostSyncContext } from "../../contexts/PostSyncContext";
import { fetchPosts } from "../../api";
import { usePageTitle } from "../../contexts/PageTitleContext";

// Sortare descrescător după dată
const sortByDate = (a: PostProps, b: PostProps) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

const Feed: React.FC = () => {
  const { state, replaceWithFeed } = usePostSyncContext();
  usePageTitle(" Live Feed");

  useEffect(() => {
    fetchPosts().then((response) => {
      const data: PostProps[] = Array.isArray(response.data)
        ? response.data
        : response.data.results;

      const posts: Record<number, PostProps> = {};
      const links: Record<number, number[]> = {};

      data.forEach((p) => {
        posts[p.id] = p;
        if (p.type === "repost" && p.parent != null) {
          links[p.parent] = [...(links[p.parent] || []), p.id];
        }
      });

      replaceWithFeed(Object.values(posts), links);
    });
  }, [replaceWithFeed]);

  const posts = Object.values(state.posts).sort(sortByDate);
  console.log(
    "[Feed] Posts to render:",
    posts.map((p) => ({
      id: p.id,
      type: p.type,
      parent: p.parent,
      liked_by_user: p.liked_by_user,
      likes_count: p.likes_count,
      reposted_by_user: p.reposted_by_user,
      reposts_counts: p.reposts_count,
      username: p.username,
    }))
  );
  return (
    <main>
      <PostInput />
      {posts.map((p) =>
        p.type !== "reply" && typeof p.id === "number" ? (
          <Post key={`${p.type}-${p.id}`} {...p} />
        ) : null
      )}
      <div style={{ height: "50vh" }} />
    </main>
  );
};

export default Feed;
