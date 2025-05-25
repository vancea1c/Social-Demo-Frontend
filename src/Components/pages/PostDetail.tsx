import  {  useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { fetchPost, fetchReplies } from "../../api";
import Post from "../Feed/Post2";
import { PostProps } from "../Feed/Post2";
import PostForm from "../PostForm2";
import { usePostSyncContext } from "../../contexts/PostSyncContext";

const sortByDate = (a: PostProps, b: PostProps) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { state, replaceWithPostDetail } = usePostSyncContext();

  console.log("PostSyncContext state on PostDetail:", state);

  useEffect(() => {
    if (!id) return;

    // Fetch main post and its replies in parallel
    Promise.all([fetchPost(+id), fetchReplies(+id)]).then(
      ([postRes, repliesRes]) => {
        const post = postRes.data;
        const replies = repliesRes.data;

        // Build links map: links[postId] = [replyId1, replyId2, ...]
        const links: Record<number, number[]> = {};
        links[post.id] = replies.map((r) => r.id);

        // Replace context with this detail page data
        replaceWithPostDetail({ post, replies, links });
      }
    );
  }, [id, replaceWithPostDetail]);

  const post = id ? state.posts[+id] : null;
  console.log("[PostDetail] postId", id, "post", post);

  const replies = (
    state.links[post?.id || 0]?.map((id) => state.posts[id]).filter(Boolean) ||
    []
  ).sort(sortByDate);

  if (!post) return <div>Loading…</div>;

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <Post {...post} disableNavigate={true} />
      </div>
      <div className="border-b">
        <div className="flex items-center">
          <span className="mr-1 ">Replying to</span>
          <span className="text-sky-600">@{post.username}</span>
        </div>
        <PostForm
          // aceste props TREBUIE să existe în PostForm2 ca write-only
          parentId={post.id}
          type={"reply"}
        />
      </div>
      <div className="space-y-4">
        {replies.length === 0 ? (
          <p className="p-4 text-gray-500">There are no comments yet.</p>
        ) : (
          replies.map((r) => <Post key={r.id} {...r} />)
        )}
      </div>
    </>
  );
};
export default PostDetail;
