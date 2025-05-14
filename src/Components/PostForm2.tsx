import React, { useState, FormEvent } from "react";
import api from "../api";
import { PostProps } from "./Feed/Post2";
import useMediaManager from "./useMediaManager";
import CropModal from "./CropModal";
import { ArrowLeft, ArrowRight, X } from "react-feather";
import { usePostSyncContext } from "../contexts/PostSyncContext";

export interface PostFormProps {
  onSuccess?: () => void;
  initialType?: PostProps["type"];
  parentId?: number;
  type?: "post" | "quote" | "reply";
  initialDescription?: string;
}

const MAX_MEDIA = 4;

const PostForm: React.FC<PostFormProps> = ({
  onSuccess,
  initialType,
  parentId,
  type,
  initialDescription,
}) => {
  // Folosim hook-ul centralizat pentru fișiere & crop
  const {
    files,
    previews,
    originalPreviews,
    aspects,
    cropStates,

    addFiles,
    removeFile,
    clearAll,

    openCrop,
    saveCrop,
    rollback,
    doCrop,
  } = useMediaManager({ maxFiles: MAX_MEDIA });

  const [text, setText] = useState(initialDescription || "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const { updatePost } = usePostSyncContext();

  const canSubmit = text.trim().length > 0 || files.length > 0;

  // Când user alege fișiere
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    addFiles(selected);
    setCurrentIndex(0);
    setSliderIndex(0);
  };

  // Șterge fișier la click
  const handleRemove = (i: number) => {
    removeFile(i);
    setCurrentIndex((idx) => Math.max(0, Math.min(idx, previews.length - 2)));
    setSliderIndex((idx) => Math.max(0, Math.min(idx, previews.length - 2)));
  };

  // Deschide modal și backup crop state
  const openModal = (i: number) => {
    openCrop(i);
    setCurrentIndex(i);
    setShowModal(true);
  };

  // Anulează și închide
  const handleCancel = () => {
    rollback();
    setShowModal(false);
  };
  const submitReply = async (parentId: number) => {
    await api.post(`/posts/${parentId}/comments/`, { content: text });

    try {
      const { data } = await api.get(`/posts/${parentId}/`);
      updatePost(parentId, { comments_count: data.comments_count });
    } catch (err) {
      console.warn("⚠️ Eroare update comments_count:", err);
    }
  };
  const submitPostOrQuote = async () => {
    const form = new FormData();
    form.append("description", text);
    form.append("type", type ?? "post");

    if (parentId != null) {
      form.append("parent", String(parentId));
    }

    files.forEach((f) => form.append("uploads", f));

    await api.post("/posts/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };
  const handleError = (err: any) => {
    setError(
      err.response?.data?.content ||
        err.response?.data?.uploads?.join(" ") ||
        err.response?.data?.description ||
        "Failed to post."
    );
  };
  // Trimite postarea
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setSubmitting(true);

    try {
      if (type === "reply" && parentId) {
        await submitReply(parentId);
      } else {
        await submitPostOrQuote();
      }

      clearAll();
      setText("");
      onSuccess?.();
    } catch (err: any) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            type === "reply" ? "Post yout reply" : "What's happening?"
          }
          className="w-full border p-2 rounded bg-black/10 text-white"
          maxLength={1000}
        />
        {error && <p className="text-red-500">{error}</p>}

        {/* preview-uri */}
        {previews.length > 0 && (
          <div className="relative w-full h-[290px] bg-back-800 overflow-hidden rounded">
            {!showModal && sliderIndex > 0 && (
              <button
                type="button"
                onClick={() => setSliderIndex((i) => i - 1)}
                disabled={sliderIndex === 0}
                className="absolute left-3 top-1/2 z-10
                transform -translate-y-1/2
                p-2
                aspect-square
                rounded-full
                flex items-center justify-center 
                bg-black/75 hover:bg-black/90 
                text-white/50 hover:text-white/75
                transition-colors duration-200
                cursor-pointer"
              >
                <ArrowLeft size={13} />
              </button>
            )}
            {/* slides wrapper */}
            <div
              className="flex h-full transition-transform duration-200"
              style={{ transform: `translateX(-${sliderIndex * 50}%)` }}
            >
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative flex-shrink-0 w-[50%] ] h-full flex items-center justify-center p-1.5 rounded-tr-4xl  "
                >
                  {files[i].type.startsWith("video/") ? (
                    <video
                      src={src}
                      controls
                      className="object-contain w-full h-full rounded cursor-pointer"
                    />
                  ) : (
                    <>
                      <img
                        src={src}
                        className="object-cover w-full h-full rounded cursor-pointer"
                        onClick={() => openModal(i)}
                      />
                      <button
                        type="button"
                        onClick={() => openModal(i)}
                        className="absolute top-10 left-5 z-10
                                    transform -translate-y-1/2
                                    px-3 py-1
                                    rounded-full
                                    flex items-center justify-center
                                  bg-black/75 hover:bg-black/90
                                   text-white/75 hover:text-white/90
                                   text-[15px]
                                    transition-colors duration-200
                                    cursor-pointer"
                      >
                        Edit
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="absolute top-10 right-5 z-10
                                    transform -translate-y-1/2
                                    p-2
                                    aspect-square
                                    rounded-full
                                    flex items-center justify-center
                                  bg-black/75 hover:bg-black/90
                                   text-white/75 hover:text-white/90
                                    transition-colors duration-200
                                    cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            {!showModal && sliderIndex < previews.length - 2 && (
              <button
                type="button"
                onClick={() => setSliderIndex((i) => i + 1)}
                className="absolute right-3 top-1/2 z-10
                transform -translate-y-1/2
                p-2
                aspect-square
                rounded-full
                flex items-center justify-center 
                bg-black/75 hover:bg-black/90 
                text-white/75 hover:text-white/90
                transition-colors duration-200
                cursor-pointer"
              >
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          {type !== "reply" && (
            <label className="text-blue-500 cursor-pointer">
              Add Media
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
          >
            {type !== "reply"
              ? submitting
                ? "Posting…"
                : "Post"
              : submitting
              ? "Replying…"
              : "Reply"}
          </button>
        </div>
      </form>

      {showModal && (
        <CropModal
          key={currentIndex}
          imageSrc={originalPreviews[currentIndex] ?? previews[currentIndex]}
          title="Crop media"
          ratioOptions={[
            { label: "Original", value: aspects[currentIndex] ?? 1 },
            { label: "1:1", value: 1 },
            { label: "16:9", value: 16 / 9 },
          ]}
          initialAspect={
            cropStates[currentIndex]?.aspect ?? aspects[currentIndex] ?? 1
          }
          initialCrop={cropStates[currentIndex]?.crop}
          initialZoom={cropStates[currentIndex]?.zoom}
          onSaveState={(state) => {
            // salvează coordonate + zoom + aspect + area în cropStates[currentIndex]
            saveCrop(currentIndex, {
              crop: state.crop,
              zoom: state.zoom,
              aspect: state.aspect,
              area: state.area ?? undefined,
            });
          }}
          onCancel={handleCancel}
          onApply={async (state) => {
            // Salvezi întâi starea ultimei poze editate (cea curentă)
            saveCrop(currentIndex, state);

            // Aplici crop-ul pe TOATE imaginile care au crop definit:
            for (let i = 0; i < cropStates.length; i++) {
              const cs = i === currentIndex ? state : cropStates[i];
              if (cs?.area) {
                await doCrop(i, cs.area);
              }
            }

            setShowModal(false);
          }}
          // --- Avansare/înapoi în carousel:
          canPrev={currentIndex > 0}
          canNext={currentIndex < previews.length - 1}
          onPrev={() => {
            setCurrentIndex(currentIndex - 1);
            openCrop(currentIndex - 1);
          }}
          onNext={() => {
            setCurrentIndex(currentIndex + 1);
            openCrop(currentIndex + 1);
          }}
          applyLabel="Save"
        />
      )}
    </>
  );
};

export default PostForm;
