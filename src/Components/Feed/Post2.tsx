import React, { useEffect, useState } from "react";
import { MessageCircle, Repeat, Heart } from "react-feather";
import api, { fetchPost } from "../../api";
import { usePostSync } from "../usePostSync";
import RepostMenu from "./RepostMenu";
import ComposeModal from "../Widgets/ComposeModal";
import { useToggleLike } from "../useToggleLike";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import PostMenu from "./PostMenu";
import ConfirmDialog from "./ConfirmDialog";
import { usePostSyncContext } from "../../contexts/PostSyncContext";

export interface MediaType {
  id: number;
  file: string;
  media_type: "photo" | "video";
}

export interface PostProps {
  id: number;
  avatar_url: string; // nou
  display_name: string; // nou
  username: string; // nou
  type: "post" | "repost" | "quote" | "reply";
  parent: number | null;
  created_at: string;
  description: string;
  posted_media: MediaType[];
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  liked_by_user: boolean;
  reposted_by_user: boolean;
  hideInteractive?: boolean;
  disableNavigate?: boolean;
}

const Post: React.FC<PostProps> = (initialProps) => {
  const { post, setPost } = usePostSync(initialProps);
  const { state: syncState, registerPost, updatePost } = usePostSyncContext();
  const { user } = useAuth();
  if (!user) {
    return <div>Loading…</div>;
  }
  const {
    id,
    avatar_url,
    display_name,
    username,
    type,
    parent,
    created_at,
    description,
    posted_media,
    comments_count,
    reposts_count,
    likes_count,
    liked_by_user,
    reposted_by_user,
    hideInteractive = false,
    disableNavigate = false,
  } = post;
  useEffect(() => {
    if ((type === "repost" || type === "quote") && parent != null) {
      if (!syncState.posts[parent]) {
        fetchPost(parent)
          .then((res) => registerPost(res.data))
          .catch(console.error);
      }
    }
  }, [type, parent, syncState.posts, registerPost]);

  const parentData = parent != null ? syncState.posts[parent] : null;

  const [showCompose, setShowCompose] = useState<{
    mode: "post" | "quote" | "reply";
    parentId?: number;
  } | null>(null);

  const date = new Date(created_at);
  const diffMs = Date.now() - date.getTime();
  const minutesAgo = Math.floor(diffMs / (1000 * 60));

  let timeLabel: string;
  if (minutesAgo < 1) {
    timeLabel = "Now";
  } else if (minutesAgo < 60) {
    timeLabel = `${minutesAgo}m`;
  } else if (minutesAgo < 60 * 24) {
    timeLabel = `${Math.floor(minutesAgo / 60)}h`;
  } else {
    // peste 24h
    const isSameYear = date.getFullYear() === new Date().getFullYear();

    if (isSameYear) {
      // ex: "Jan 05"
      timeLabel = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } else {
      // ex: "Jan 05, 2023"
      timeLabel = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  const { liked, count, toggle } = useToggleLike(post);

  const [showDelete, setShowDelete] = useState(false);
  async function handleDelete() {
    try {
      await api.delete(`/posts/${id}/`);
      setShowDelete(false);
      // WS va scoate din feed automat (post_delete),
      // Dacă vrei instant local, poți și manual:
      // dispatch({ type: "UNREGISTER", id });
    } catch (err) {
      setShowDelete(false);
      alert("Eroare la ștergere!");
    }
  }

  // decide wrapper: Link sau div
  const Wrapper: React.ElementType = disableNavigate ? "div" : Link;
  const wrapperProps = disableNavigate
    ? {}
    : { to: `/${username}/posts/${id}` };
  // 5) ramura repost
  if (type === "repost" && parentData) {
    const isMe = user.username === username;
    return (
      <div className={`flex flex-col`}>
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <Repeat />
          <span className="font-semibold text-gray-600 mr-1">
            {isMe ? "You" : display_name}
          </span>
          <span className="text-gray-500">reposted</span>
        </div>
        <Post {...parentData} />
      </div>
    );
  }

  return (
    <>
      <Wrapper
        {...wrapperProps}
        className={` ${
          disableNavigate
            ? ""
            : "cursor-pointer block hover:bg-gray-800 rounded"
        }`}
      >
        <div className={`flex p-3 ${hideInteractive ? "" : "border-b"}`}>
          {/* Avatar */}
          <img
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            src={avatar_url}
            alt={`${display_name} avatar`}
            className="w-12 h-12 rounded-full mr-4"
          />

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <span
                  className="font-semibold text-gray-900 mr-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {display_name}
                </span>
                <span
                  className="mr-2 text-gray-500"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  @{username}
                </span>
                <span title={date.toLocaleString()}>{timeLabel}</span>
              </div>
              {!hideInteractive && (
                <div className="flex items-center space-x-1">
                  <PostMenu
                    isMe={user.username === username}
                    onDelete={() => setShowDelete(true)}
                    onAddFriend={() => {
                      // TODO: Pune logica de Add Friend (API)
                      alert("Friend request sent (mock)");
                    }}
                    onBlock={() => {
                      // TODO: Pune logica de Block (API)
                      alert("User blocked (mock)");
                    }}
                  />
                  <ConfirmDialog
                    open={showDelete}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDelete(false)}
                  />
                </div>
                // <button
                //   onClick={(e) => {
                //     e.preventDefault();
                //     e.stopPropagation();
                //   }}
                //   className="p-1 hover:bg-gray-200 rounded-full"
                // >
                //   <MoreHorizontal size={16} />
                // </button>
              )}
            </div>

            {/* Conținut */}
            <div className="mt-2">
              <p>{description}</p>
              {posted_media?.length > 0 && (
                <div className="mt-2 grid gap-2 grid-cols-1">
                  {posted_media.map((m) =>
                    m.media_type === "photo" ? (
                      <img
                        key={m.id}
                        src={m.file}
                        alt=""
                        className="rounded max-h-80 object-cover"
                      />
                    ) : (
                      <video
                        key={m.id}
                        src={m.file}
                        controls
                        className="rounded max-h-80 object-cover"
                      />
                    )
                  )}
                </div>
              )}

              {/* quote */}
              {initialProps.type === "quote" &&
                parentData &&
                parentData.id !== post.id && (
                  <div className="border rounded mt-2">
                    <Post {...parentData} hideInteractive disableNavigate />
                  </div>
                )}
              {initialProps.type === "quote" &&
                parentData &&
                parentData.id === post.id && (
                  <div className="text-red-500">
                    Eroare: Quote la propriul quote! (recursivitate blocată)
                  </div>
                )}
            </div>

            {/* Butoane */}
            {!hideInteractive && (
              <div className="flex justify-center gap-40 mt-3 text-gray-600 text-sm">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCompose({ mode: "reply", parentId: post.id });
                  }}
                  className="cursor-pointer flex items-center space-x-1 "
                >
                  <MessageCircle size={18} />
                  {comments_count > 0 && <span>{comments_count}</span>}
                </div>
                <div
                  className="flex items-center space-x-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <RepostMenu
                    post={post}
                    onQuote={() =>
                      setShowCompose({ mode: "quote", parentId: id })
                    }
                    hideIfReply={post.type === "reply"}
                  />
                </div>

                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle();
                  }}
                  className="cursor-pointer flex items-center space-x-1"
                >
                  <Heart className={liked ? "text-red-500" : ""} />
                  {count > 0 && <span>{count}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </Wrapper>
      {/* Modal pentru quote */}
      {showCompose && (
        <ComposeModal
          mode={showCompose.mode}
          parentId={showCompose.parentId}
          onClose={() => setShowCompose(null)}
          onSuccess={() => {
            setShowCompose(null);
          }}
          onReply={(updatedParent) => {
            setPost(updatedParent);
            setShowCompose(null);
          }}
          onQuote={(counts) => {
            setPost(counts);
            setShowCompose(null);
          }}
        />
      )}
    </>
  );
};
export default Post;
