import React, { useEffect, useState } from "react";
import { X } from "react-feather";
import PostForm from "../PostForm2";
import Post, { PostProps } from "../Feed/Post2";
import api from "../../api";

export interface ComposeModalProps {
  mode?: "post" | "quote" | "reply";
  parentId?: number;
  initialText?: string;
  onClose: () => void;
  onSuccess: () => void;
  onReply?: (updatedParent: PostProps) => void;
  onQuote?: (updatedParent: PostProps) => void;
}

const ComposeModal: React.FC<ComposeModalProps> = ({
  mode = "post",
  parentId,
  initialText = "",
  onClose,
  onSuccess,
  onReply,
  onQuote,
}) => {
  const [parentPost, setParentPost] = useState<PostProps | null>(null);

  useEffect(() => {
    if ((mode === "quote" || mode === "reply") && parentId) {
      api
        .get<PostProps>(`/posts/${parentId}/`)
        .then((res) => setParentPost(res.data))
        .catch(console.error);
    }
  }, [mode, parentId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30">
      <div className="bg-black rounded-lg w-full max-w-md p-4">
        <div className="flex justify-between mb-2">
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <PostForm
          parentId={parentId}
          type={mode}
          initialDescription={initialText}
          onReply={(updated) => {
            setParentPost(updated);
            onReply?.(updated);
          }}
          onQuote={(updated) => {
            setParentPost(updated);
            onQuote?.(updated);
          }}
          onSuccess={() => {
            onClose();
          }}
        />
        {/* Dacă e quote, arătăm un mic banner */}
        {mode === "quote" && parentId && parentPost && (
          <Post
            {...(parentPost as PostProps)}
            hideInteractive
            disableNavigate
          ></Post>
        )}
        {/* Dacă e reply, similar */}
        {mode === "reply" && parentPost && (
          <div className="mt-4 px-3 py-2 bg-gray-900 rounded">
            <p className="text-gray-400 text-sm mb-2">
              Replying to{" "}
              <span className="font-semibold">@{parentPost.username}</span>
            </p>
            <Post {...parentPost} hideInteractive />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComposeModal;
