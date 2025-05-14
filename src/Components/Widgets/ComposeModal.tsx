import React, { useEffect, useState } from "react";
import { X } from "react-feather";
import PostForm from "../PostForm2";
import { useFeedRefresh } from "../../contexts/FeedRefreshContext";
import Post, { PostProps } from "../Feed/Post2";
import api from "../../api";

interface ComposeModalProps {
  mode?: "post" | "quote" | "reply";
  parentId?: number;
  initialText?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ComposeModal: React.FC<ComposeModalProps> = ({
  mode = "post",
  parentId,
  initialText = "",
  onClose,
  onSuccess,
}) => {
  const { triggerRefresh } = useFeedRefresh();

  // Determinăm eticheta butonului și titlul
  const isQuote = mode === "quote";
  const isReply = mode === "reply";
  const [parentPost, setParentPost] = useState<PostProps | null>(null);
  // 1️⃣ când e “quote” + avem parentId, fetching
  useEffect(() => {
    if (isQuote || (isReply && parentId)) {
      api
        .get<PostProps>(`/posts/${parentId}/`)
        .then((res) => setParentPost(res.data))
        .catch(console.error);
    }
  }, [isQuote, isReply, parentId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30">
      <div className="bg-black rounded-lg w-full max-w-md p-4">
        <div className="flex justify-between mb-2">
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        {/* aici e același formular reutilizat */}
        <PostForm
          onSuccess={() => {
            triggerRefresh();
            onClose();
          }}
          // aceste props TREBUIE să existe în PostForm2 ca write-only
          parentId={parentId}
          type={mode}
          initialDescription={initialText}
        />
        {/* Dacă e quote, arătăm un mic banner */}
        {isQuote && parentId && (
          <Post {...(parentPost as PostProps)} hideInteractive></Post>
        )}
        {/* Dacă e reply, similar */}
        {isReply && parentPost && (
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
