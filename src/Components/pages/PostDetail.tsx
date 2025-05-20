import React, { useCallback, useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { fetchPost, fetchReplies } from "../../api";
import { usePostSync } from "../usePostSync";
import Post from "../Feed/Post2";
import { PostProps } from "../Feed/Post2";
import PostForm from "../PostForm2";

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostProps | null>(null);
  const [replies, setReplies] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);
  // 1️⃣ Load the main post
  const loadPost = useCallback(async () => {
    if (!postId) return;
    try {
      const { data } = await fetchPost(+postId);
      setPost(data);
    } catch (err) {
      console.error("Error loading post:", err);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // 2️⃣ Load replies (comments) as full PostProps
  const loadReplies = useCallback(async () => {
    if (!postId) return;
    try {
      const { data } = await fetchReplies(+postId);
      setReplies(data);
    } catch (err) {
      console.error("Error loading replies:", err);
      setReplies([]);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
    loadReplies();
  }, [loadPost, loadReplies]);

  if (loading) return <div>Loading…</div>;
  if (!post) return <div>Post not found.</div>;
  return (
    <>
      <div className="max-w-2xl mx-auto">
        <Post {...post} disableNavigate={true} />
      </div>
      <div className="border-b">
        <PostForm
          // aceste props TREBUIE să existe în PostForm2 ca write-only
          parentId={post.id}
          type={"reply"}
          onSuccess={loadReplies}
        />
      </div>
      <div className="space-y-4">
        {replies.length === 0 ? (
          <p className="p-4 text-gray-500">Nu există comentarii încă.</p>
        ) : (
          replies.map((r) => <Post key={r.id} {...r} disableNavigate />)
        )}
      </div>
    </>
  );
};
export default PostDetail;
