import React, { useEffect, useState } from "react";
import PostInput from "./PostInput";
import Post from "./Post";
import axios from "axios";

interface PostType {
  id: number;
  author: string;
  content: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    axios.get<PostType[]>("/api/posts/").then((res) => setPosts(res.data));
  }, []);

  return (
    <main style={{ overflowY: "auto" }}>
      <PostInput />
      {posts.map((p) => (
        <Post key={p.id} {...p} />
      ))}
    </main>
  );
};

export default Feed;
