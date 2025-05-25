import React, { useEffect} from "react";
import PostInput from "./PostInput";
import Post, { PostProps } from "./Post2";
import { usePostSyncContext } from "../../contexts/PostSyncContext";
import { fetchPosts } from "../../api";

// Sortare descrescător după dată
const sortByDate = (a: PostProps, b: PostProps) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

const Feed: React.FC = () => {
  const { state, replaceWithFeed } = usePostSyncContext();

  useEffect(() => {
    fetchPosts().then((res) => {
      // Imagine res.data is your array of PostProps
      // Build links if you want, or have backend send them
      const posts = Array.isArray(res.data) ? res.data : res.data.results;
      const links: Record<number, number[]> = {};
      posts.forEach((p) => {
        if (p.parent != null) {
          links[p.parent] = [...(links[p.parent] || []), p.id];
        }
      });

      // **Replace context with feed**
      replaceWithFeed(posts, links);
    });
  }, [replaceWithFeed]);

  const posts = Object.values(state.posts).sort(sortByDate);
  console.log(
    "[Feed] Posts to render:",
    posts.map((p) => ({ id: p.id, type: p.type, parent: p.parent }))
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
