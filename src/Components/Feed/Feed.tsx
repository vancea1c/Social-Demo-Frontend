import React, { useEffect, useState } from "react";
import PostInput from "./PostInput";
import api from "../../api";
import Post, { PostProps } from "./Post2";
import { useFeedRefresh } from "../../contexts/FeedRefreshContext";
import { usePostSyncContext } from "../../contexts/PostSyncContext";

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const { refreshKey } = useFeedRefresh();
  const { setOnNewPost } = usePostSyncContext();

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts/");
      const rawData: PostProps[] = Array.isArray(response.data)
        ? response.data
        : response.data.results;
      // 🔍 DEBUG: log all posts
      rawData.forEach((post, idx) => {
        console.log(`📦 Feed data sample [${idx}]:`, post);
      });

      setPosts(rawData);
    } catch (err: any) {
      console.error("🛑 Eroare la fetchPosts:", err.response ?? err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshKey]);

  useEffect(() => {
    setOnNewPost?.((newPost) => {
      setPosts((prev) => {
        const exists = prev.some((p) => p.id === newPost.id);
        if (exists) return prev; // evităm duplicatul!
        return [newPost, ...prev];
      });
    });
  }, []);

  return (
    <main>
      <PostInput />
      {posts
        .filter((p): p is PostProps => p && typeof p.id === "number")
        .map((p) => (
          <Post key={p.id} {...p} />
        ))}
    </main>
  );
};

export default Feed;
