import React, { useEffect, useState } from "react";
import { MessageCircle, Repeat, Heart, MoreHorizontal } from "react-feather";
import api from "../../api";
import { useToggleLike } from "../../hooks/useToggleLike";
import { useFeedRefresh } from "../../contexts/FeedRefreshContext";
import { usePostSync } from "../../hooks/usePostSync";
import RepostMenu from "./RepostMenu";
import ComposeModal from "../Widgets/ComposeModal";

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
}

const Post: React.FC<PostProps> = (initialProps) => {
  const { post } = usePostSync(initialProps);
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
  } = post;

  const [showCompose, setShowCompose] = useState<{
    mode: "post" | "quote" | "reply";
    parentId?: number;
  } | null>(null);

  const [parentData, setParentData] = useState<PostProps | null>(null);
  const { refreshKey } = useFeedRefresh();
  useEffect(() => {
    if ((type === "quote" || type === "repost") && parent) {
      api
        .get<PostProps>(`/posts/${parent}/`)
        .then((res) => setParentData(res.data))
        .catch(console.error);
    }
  }, [type, parent, refreshKey]);

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

  const [replies, setReplies] = useState<PostProps[]>([]);

  useEffect(() => {
    if (hideInteractive) return; // <<< NU/ÎN MODUL PREVIEW, nu fetch
    api
      .get<PostProps[]>(`/posts/?type=reply&parent=${id}`)
      .then((res) => setReplies(res.data))
      .catch((err) => console.error(err));
  }, [id, hideInteractive]);

  const { liked, count, toggle } = useToggleLike(
    "posts",
    id,
    liked_by_user,
    likes_count
  );

  const { triggerRefresh } = useFeedRefresh();

  const handleQuote = () => {
    setShowCompose({ mode: "quote", parentId: id });
  };

  return (
    <>
      {/* Dacă este repost: doar anunț și instanță completă a postării originale */}
      {type === "repost" && parentData ? (
        <div className={`flex flex-col  ${hideInteractive ? "" : "border-b"}`}>
          {/* Header: userul care a dat repost */}
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Repeat />
            <span className="font-semibold text-gray-600 mr-1">
              {username === localStorage.getItem("username")
                ? "You"
                : display_name}
            </span>
            <span className="text-gray-500">reposted</span>
          </div>

          {/* Postarea originală — completă, cu butoane */}
          <Post {...parentData} />
        </div>
      ) : (
        // Postare normală sau quote
        <div className={`flex p-4 ${hideInteractive ? "" : "border-b"}`}>
          {/* Avatar */}
          <img
            src={avatar_url}
            alt={`${display_name} avatar`}
            className="w-12 h-12 rounded-full mr-4"
          />

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-semibold text-gray-900 mr-2">
                  {display_name}
                </span>
                <span className="mr-2 text-gray-500">@{username}</span>
                <span title={date.toLocaleString()}>{timeLabel}</span>
              </div>
              {!hideInteractive && (
                <button className="p-1 hover:bg-gray-200 rounded-full">
                  <MoreHorizontal size={16} />
                </button>
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

              {/* Dacă e quote — include postarea originală */}
              {type === "quote" && parentData && (
                <div className="border rounded mt-2">
                  <Post {...parentData} hideInteractive />
                </div>
              )}
            </div>

            {/* Butoane */}
            {!hideInteractive && (
              <div className="flex justify-center gap-40 mt-3 text-gray-600 text-sm">
                {comments_count > 0 ? (
                  <div
                    onClick={() =>
                      setShowCompose({ mode: "reply", parentId: id })
                    }
                    className="cursor-pointer flex items-center space-x-1 "
                  >
                    <MessageCircle size={18} />
                    <span>{comments_count}</span>
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      setShowCompose({ mode: "reply", parentId: id })
                    }
                    className=" cursor-pointer flex items-center space-x-1"
                  >
                    <MessageCircle size={18} />
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <RepostMenu postId={id} onQuote={handleQuote} />
                </div>
                {likes_count > 0 ? (
                  <div
                    onClick={toggle}
                    className="cursor-pointer flex items-center space-x-1 "
                  >
                    <Heart className={liked ? "text-red-500" : ""} />
                    <span>{count}</span>
                  </div>
                ) : (
                  <div onClick={toggle} className="cursor-pointer">
                    <Heart className={liked ? "text-red-500" : ""} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal pentru quote */}
      {showCompose && (
        <ComposeModal
          mode={showCompose.mode}
          parentId={showCompose.parentId}
          onClose={() => setShowCompose(null)}
          onSuccess={() => {
            triggerRefresh();
            setShowCompose(null);
          }}
        />
      )}
    </>
  );
};
export default Post;
