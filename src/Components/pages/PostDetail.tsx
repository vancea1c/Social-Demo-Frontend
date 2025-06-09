import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { fetchPost, fetchReplies } from "../../api";
import Post from "../Feed/Post2";
import { PostProps } from "../Feed/Post2";
import PostForm from "../PostForm2";
import { usePostSyncContext } from "../../contexts/PostSyncContext";
import { useAuth } from "../AuthContext";
import { useUserProfiles } from "../../contexts/UserProfilesContext";
import { usePageTitle } from "../../contexts/PageTitleContext";

const sortByDate = (a: PostProps, b: PostProps) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { state, replaceWithPostDetail } = usePostSyncContext();
  const { isReady, user, profile: myProfile } = useAuth();
  const { profiles, fetchProfile } = useUserProfiles();

  usePageTitle(`Post`);

  // console.log("PostSyncContext state on PostDetail:", state);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [postRes, replyRes] = await Promise.all([
          fetchPost(+id),
          fetchReplies(+id),
        ]);
        replaceWithPostDetail({
          post: postRes.data,
          replies: replyRes.data,
          links: { [postRes.data.id]: replyRes.data.map((r) => r.id) },
        });
      } catch (err) {
        console.error("Failed to load post detail:", err);
      }
    };
    if (id) load();
  }, [id, replaceWithPostDetail]);

  const post = id ? state.posts[+id] : null;
  // console.log("[PostDetail] postId", id, "post", post);

  const replies = (
    state.links[post?.id || 0]?.map((id) => state.posts[id]).filter(Boolean) ||
    []
  ).sort(sortByDate);

  useEffect(() => {
    if (post && post.username !== user?.username) {
      fetchProfile(post.username).catch(console.error);
    }
  }, [post, user, profiles, fetchProfile]);

  if (!post || !isReady) return <div>Loading…</div>;

  const isMe = post.username === user?.username;
  const authorProfile = isMe ? myProfile : profiles[post.username];
  const avatarSrc = authorProfile?.profile_image ?? post.avatar_url;
  const nameToShow = authorProfile?.name ?? post.display_name;

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <Post
          {...post}
          disableNavigate={true}
          avatar_url={avatarSrc}
          display_name={nameToShow}
        />
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
          replies.map((r) => (
            <Post
              key={r.id}
              {...r}
              avatar_url={profiles[r.username]?.profile_image ?? r.avatar_url}
              display_name={profiles[r.username]?.name ?? r.display_name}
            />
          ))
        )}
      </div>
    </>
  );
};
export default PostDetail;
