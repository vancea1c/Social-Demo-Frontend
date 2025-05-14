import React, { useState, useEffect, FormEvent, useRef } from "react";
import api from "../api";
import { PostProps } from "./Feed/Postbackup";
import Cropper, { Area } from "react-easy-crop";
import { getImageAspect } from "../utils/getImageAspect";

export interface PostFormProps {
  /** Callback apelat după ce cererea s-a încheiat cu succes */
  onSuccess?: () => void;
  /** Textul butonului de submit (ex: "Post", "Save") */
  submitLabel?: string;

  initialType?: PostProps["type"];
  parentId?: number;
}

const MAX_MEDIA = 4;
const MAX_VIDEO_SIZE = 256 * 1024 * 1024; // 256 MB

// Hook pentru gestionarea fișierelor, preview-urilor și aspectelor
function useFilePreviews(maxFiles: number) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [aspects, setAspects] = useState<number[]>([]);

  // Generare preview și aspect atunci când files se schimbă
  useEffect(() => {
    // revocarea vechilor URL-uri
    previews.forEach(URL.revokeObjectURL);

    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);

    Promise.all(urls.map(getImageAspect))
      .then(setAspects)
      .catch((err) => {
        console.error("Failed to compute aspects", err);
        setAspects([]); // sau păstrează vechiul state
      });
  }, [files]);

  const addFiles = (selected: File[]) => {
    const valid = selected.filter(
      (f) => !(f.type.startsWith("video/") && f.size > MAX_VIDEO_SIZE)
    );
    setFiles((prev) => prev.concat(valid).slice(0, maxFiles));
  };
  const replaceFile = (idx: number, file: File) => {
    setFiles((prev) => {
      const next = [...prev];
      next[idx] = file;
      return next;
    });
  };

  const clear = () => setFiles([]);
  // Cleanup la demontare
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), []);

  return {
    files,
    setFiles,
    previews,
    setPreviews,
    addFiles,
    replaceFile,
    clear,
  };
}

// helper: primeşte URL-ul imaginii şi aria de crop, returnează blob-ul şi un nou URL
async function getCroppedImage(
  imageSrc: string,
  cropArea: Area
): Promise<{ blob: Blob; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // creează canvas exact pe dimensiunea cropArea
      const canvas = document.createElement("canvas");
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      const ctx = canvas.getContext("2d")!;
      // desenează în canvas doar partea cropată
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      // exportă ca blob JPEG
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Canvas empty"));
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
      }, "image/jpeg");
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

const PostForm: React.FC<PostFormProps> = ({
  onSuccess,
  submitLabel = "Post",
  initialType,
  parentId,
}) => {
  const {
    files,
    setFiles,
    previews,
    setPreviews,
    addFiles,
    replaceFile,
    clear,
  } = useFilePreviews(MAX_MEDIA);

  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [index, setIndex] = useState(0);
  const canSubmit = text.trim().length > 0 || files.length > 0;

  // Pentru crop + modal
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [aspect, setAspect] = useState<number>(1);

  const [originalPreviews, setOriginalPreviews] = useState<string[]>([]);
  const [originalAspects, setOriginalAspects] = useState<number[]>([]);
  const [isEdited, setIsEdited] = useState<boolean[]>([]);
  // fiecare intrare e fie propriul state, fie undefined
  const [cropStates, setCropStates] = useState<
    (
      | { crop: { x: number; y: number }; zoom: number; aspect: number }
      | undefined
    )[]
  >([]);
  // 📦 Backup‐ul temporar la open
  const backupCropStates = useRef<typeof cropStates>([]);

  // În componentă, înainte de render:
  const original = originalAspects[currentIndex] ?? 1;

  const ratioOptions: { label: string; value: number }[] = [
    { label: "Original", value: original },
    { label: "1:1", value: 1 },
    { label: "16:9", value: 16 / 9 },
  ];
  // Când user‐ul alege fișiere, le adăugăm în lista curentă, până la MAX_MEDIA
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files ? Array.from(e.target.files) : [];
    addFiles(selected);
    const newOriginalUrls = selected.map((f) => URL.createObjectURL(f));
    setOriginalPreviews((prev) =>
      [...prev, ...newOriginalUrls].slice(0, MAX_MEDIA)
    );
    // iar ca să afli raportul de aspect al fiecărei imagini încărcate:
    // 2) calculezi aspectul nativ o singură dată
    Promise.all(newOriginalUrls.map(getImageAspect)).then((newAspects) => {
      setOriginalAspects((prev) => {
        const next = [...prev];
        newAspects.forEach((a, i) => {
          next[prev.length + i] = a;
        });
        return next.slice(0, MAX_MEDIA);
      });
    });
    setIsEdited((prev) => {
      const next = [...prev];
      // pentru noile intrări, inițializează cu false
      newOriginalUrls.forEach((_, idx) => {
        next[prev.length + idx] = false;
      });
      return next;
    });
    e.target.value = "";
    setCurrentIndex(0);
    setIndex(0);
  };
  const openModalAt = (i: number) => {
    // 1) memorezi snapshot‐ul
    backupCropStates.current = cropStates.slice();
    // 2) initializezi crop/zoom/aspect din ce era deja comis sau default
    const cs = cropStates[i];
    setCrop(cs?.crop ?? { x: 0, y: 0 });
    setZoom(cs?.zoom ?? 1);
    setAspect(cs?.aspect ?? originalAspects[i] ?? 1);
    // 3) deschizi modal
    setCurrentIndex(i);
    setShowModal(true);
  };

  const handleCropSave = async () => {
    if (!croppedArea) return setShowModal(false);
    try {
      // 1) crop pe original, nu pe preview-ul deja decupat
      const source = originalPreviews[currentIndex];
      const { blob, url } = await getCroppedImage(source, croppedArea);
      const file = new File([blob], `cropped-${currentIndex}.jpg`, {
        type: "image/jpeg",
      });
      replaceFile(currentIndex, file);
      setPreviews((prev: string[]) => {
        // 1) revoci vechiul URL
        URL.revokeObjectURL(prev[currentIndex]);
        // 2) construieşti array-ul nou
        return prev.map((p, i) => (i === currentIndex ? url : p));
      });
      // 3) salvezi ultima configurație și marchezi editul
      setCropStates((prev) => {
        const next = [...prev];
        next[currentIndex] = { crop, zoom, aspect };
        return next;
      });
      setIsEdited((prev) => {
        const next = [...prev];
        next[currentIndex] = true;
        return next;
      });
    } catch {
      setError("Failed to crop image.");
    } finally {
      setShowModal(false);
    }
  };

  // când navigăm în modal, încarci fie starea editată, fie default
  const goToIndex = (i: number) => {
    // 1) înainte să schimbi poza, salvezi în cropStates
    setCropStates((prev) => {
      const next = [...prev];
      next[currentIndex] = { crop, zoom, aspect };
      return next;
    });
    // 2) schimbi index-ul
    setCurrentIndex(i);
    // 3) apoi reinițializezi crop/zoom/aspect din starea salvată
    const cs = cropStates[i];
    setCrop(cs?.crop ?? { x: 0, y: 0 });
    setZoom(cs?.zoom ?? 1);
    setAspect(cs?.aspect ?? originalAspects[i] ?? 1);
  };

  const onBack = () => {
    // dacă dai Back, revii la snapshot‐ul iniţial
    setCropStates(backupCropStates.current);
    setShowModal(false);
  };
  const onSave = () => {
    // înainte de a închide, salvezi ultima poziţie
    setCropStates((prev) => {
      const next = [...prev];
      next[currentIndex] = { crop, zoom, aspect };
      return next;
    });
    // apoi faci crop + replace preview + închizi modal
    handleCropSave();
  };

  // În componentă, în loc de removeFile sau handleRemove vechi:
  const handleRemove = (idx: number) => {
    // 1) revoke previews URL
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });

    // 2) revoke original URL
    setOriginalPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });

    // 3) scoate File-ul din files
    setFiles((prev) => prev.filter((_, i) => i !== idx));

    // 4) scoate aspectul original
    setOriginalAspects((prev) => prev.filter((_, i) => i !== idx));

    // 5) scoate edit‐flag şi cropStates
    setIsEdited((prev) => prev.filter((_, i) => i !== idx));
    setCropStates((prev) => prev.filter((_, i) => i !== idx));

    // 6) ajustează index‐urile curente ca să nu iasă din array
    setIndex((old) => Math.max(0, Math.min(old, previews.length - 2)));
    setCurrentIndex((old) => Math.max(0, Math.min(old, previews.length - 2)));
  };

  // 3. la submit trimitem API‐ul
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);

    const form = new FormData();
    form.append("type", initialType || "post");
    if (parentId) form.append("parent", String(parentId));
    form.append("description", text);
    files.forEach((f) => form.append("uploads", f));

    try {
      await api.post("/posts/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // 1) închide URL-urile vechi
      previews.forEach(URL.revokeObjectURL);
      originalPreviews.forEach(URL.revokeObjectURL);

      // 2) golește absolut toate stările
      clear(); // → files = []
      setPreviews([]); // → previews = []
      setOriginalPreviews([]); // → originalPreviews = []
      setOriginalAspects([]); // → originalAspects = []
      setCropStates([]); // → cropStates = []
      setIsEdited([]); // → isEdited = []

      setText(""); // → textarea = ""
      onSuccess?.(); // anunță parent-ul să refetch-uiască feed-ul
    } catch (err: any) {
      setError(
        err.response?.data?.uploads?.join(" ") ||
          err.response?.data?.description ||
          "Failed to post."
      );
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
          placeholder="What's happening?"
          className="w-full border p-2 rounded bg-black/10 text-white"
          maxLength={1000}
        />

        {error && <p className="text-red-500">{error}</p>}

        {/* preview-uri */}
        {previews.length > 0 && (
          <div className="relative w-full h-[290px] bg-back-800 overflow-hidden rounded">
            {!showModal && index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => i - 1)}
                className="absolute 
                left-2 top-30
                w-8 h-8 z-10
                flex items-center justify-center
               bg-black/75 hover:bg-black/90
                text-white
                rounded-full
                transition-colors duration-200
                cursor-pointer"
              >
                ‹
              </button>
            )}

            {/* slides wrapper */}
            <div
              className="flex h-full transition-transform duration-200"
              style={{ transform: `translateX(-${index * 50}%)` }}
            >
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative flex-shrink-0 w-[50%] ] h-full flex items-center justify-center p-1.5 rounded-tr-4xl  "
                >
                  {/* image or video */}
                  {files[i].type.startsWith("video/") ? (
                    <video
                      src={src}
                      className="max-h-full max-w-full object-contain rounded cursor-pointer"
                      controls
                      onClick={() => {
                        goToIndex(i);
                        setShowModal(true);
                      }}
                    />
                  ) : (
                    <img
                      src={src}
                      className="h-full w-full object-cover cursor-pointer rounded-[15px]"
                      alt={`preview ${i + 1}`}
                      onClick={() => {
                        goToIndex(i);
                        setShowModal(true);
                      }}
                    />
                  )}
                  {/* remove */}
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="absolute top-4 right-4 
                    w-10 h-10 z-10
                    flex items-center justify-center
                  bg-black/75 hover:bg-black/90
                    text-white
                    rounded-full
                    transition-colors duration-200
                    cursor-pointer"
                  >
                    ×
                  </button>

                  <button
                    type="button"
                    onClick={() => openModalAt(i)}
                    className="absolute bottom-8 right-4  w-15 h-15 z-10
                    flex items-center justify-center
                  bg-black/75 hover:bg-black/90
                    text-white
                    rounded-full
                    transition-colors duration-200
                    cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
            {!showModal && index < previews.length - 2 && (
              <button
                type="button"
                onClick={() => setIndex((i) => i + 1)}
                className="absolute 
                right-2 top-30 
                w-8 h-8 z-10
                flex items-center justify-center
               bg-black/75 hover:bg-black/90
                text-white
                rounded-full
                transition-colors duration-200
                cursor-pointer
                "
              >
                ›
              </button>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <label
            className={`cursor-pointer text-blue-500 ${
              files.length >= MAX_MEDIA ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Add Media
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              disabled={files.length >= MAX_MEDIA}
              className="hidden"
            />
          </label>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
          >
            {submitting ? "Posting…" : submitLabel}
          </button>
        </div>
      </form>
      {/* Modal crop/navigation */}
      {showModal && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center">
          <div className="bg-black rounded-lg overflow-hidden w-3/4 ">
            <div className="flex justify-between items-center p-4 border-b">
              <button
                className="w-15 h-15 z-10
                  flex items-center justify-center
                 bg-gray-800/50 hover:bg-gray-800/90
                  text-white
                  rounded-full
                  transition-colors duration-200
                  cursor-pointer"
                onClick={onBack}
              >
                Back
              </button>

              <h1>Crop media</h1>
              <div className="flex">
                <button
                  className="w-15 h-15 z-10
                flex items-center justify-center
               bg-gray-800/50 hover:bg-gray-800/90
                text-white
                rounded-full
                transition-colors duration-200
                cursor-pointer"
                  onClick={() =>
                    goToIndex(
                      (currentIndex - 1 + previews.length) % previews.length
                    )
                  }
                >
                  ‹
                </button>
                <button
                  className="w-15 h-15 z-10
                  flex items-center justify-center
                bg-gray-800/50 hover:bg-gray-800/90
                  text-white
                  rounded-full
                  transition-colors duration-200
                  cursor-pointer"
                  onClick={() =>
                    goToIndex((currentIndex + 1) % previews.length)
                  }
                >
                  ›
                </button>
              </div>
              <button
                onClick={onSave}
                className="w-15 h-15 z-10
                flex items-center justify-center
               bg-gray-800/50 hover:bg-gray-800/90
                text-white
                rounded-full
                transition-colors duration-200
                cursor-pointer"
              >
                Save
              </button>
            </div>

            <div className="relative h-96 bg-gray-200">
              {files[currentIndex].type.startsWith("image/") ? (
                <Cropper
                  image={originalPreviews[currentIndex]}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, area) => setCroppedArea(area)}
                />
              ) : (
                <video
                  src={previews[currentIndex]}
                  controls
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="flex space-x-2">
              {ratioOptions.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setAspect(value)}
                  className={`w-15 h-15 z-10
                flex items-center justify-center
               bg-gray-800/50 hover:bg-gray-800/90
                text-white
                rounded-full
                transition-colors duration-200
                cursor-pointer  ${aspect === value ? "font-bold" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* slider zoom */}
            <div className="p-4">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostForm;
