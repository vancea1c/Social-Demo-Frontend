import { useState, useEffect, useRef, useCallback } from "react";
import { Area } from "react-easy-crop";
import { getImageAspect } from "../utils/getImageAspect";
import { getCroppedImg } from "../utils/cropImage";

export interface MediaManagerOptions {
  maxFiles?: number;
  maxVideoSizeBytes?: number;
}

export interface CropState {
  crop: { x: number; y: number };
  zoom: number;
  aspect: number;
  area?: Area | null;
}

export default function useMediaManager({
  maxFiles = 4,
  maxVideoSizeBytes = 256 * 1024 * 1024,
}: MediaManagerOptions = {}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [originalPreviews, setOriginalPreviews] = useState<string[]>([]);
  const [aspects, setAspects] = useState<number[]>([]);
  const [cropStates, setCropStates] = useState<(CropState | undefined)[]>([]);
  const backupCropStates = useRef<(CropState | undefined)[]>([]);

  // Add new files
  const addFiles = useCallback(
    (selected: File[]) => {
      const valid = selected.filter(
        (f) => !(f.type.startsWith("video/") && f.size > maxVideoSizeBytes)
      );
      if (!valid.length) return;

      // generate object URLs for originals
      const newOriginalUrls = valid.map((f) => URL.createObjectURL(f));
      setOriginalPreviews((prev) =>
        [...prev, ...newOriginalUrls].slice(0, maxFiles)
      );
      // compute aspects
      Promise.all(newOriginalUrls.map(getImageAspect))
        .then((newAspects) => {
          setAspects((prev) => [...prev, ...newAspects].slice(0, maxFiles));
        })
        .catch(() => {});

      // update files & reset crop states
      setFiles((prev) => {
        const next = [...prev, ...valid].slice(0, maxFiles);
        setCropStates((cs) =>
          [...cs, ...newOriginalUrls.map(() => undefined)].slice(0, maxFiles)
        );
        return next;
      });
    },
    [maxFiles, maxVideoSizeBytes]
  );

  // rebuild previews whenever files change
  useEffect(() => {
    previews.forEach(URL.revokeObjectURL);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
      originalPreviews.forEach(URL.revokeObjectURL);
    };
  }, []);

  const replaceFile = useCallback((idx: number, file: File) => {
    setFiles((prev) => {
      const next = [...prev];
      next[idx] = file;
      return next;
    });
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setOriginalPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
    setAspects((prev) => prev.filter((_, i) => i !== idx));
    setCropStates((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((_, i) => URL.revokeObjectURL(previews[i]));
    originalPreviews.forEach(URL.revokeObjectURL);
    setFiles([]);
    setPreviews([]);
    setOriginalPreviews([]);
    setAspects([]);
    setCropStates([]);
  }, [files, previews, originalPreviews]);

  // Crop modal lifecycle
  const openCrop = useCallback(
    (idx: number) => {
      backupCropStates.current = cropStates.slice();
    },
    [cropStates]
  );

  const saveCrop = useCallback((idx: number, state: CropState) => {
    setCropStates((cs) => {
      const next = [...cs];
      next[idx] = state;
      return next;
    });
  }, []);

  const rollback = useCallback(() => {
    setCropStates(backupCropStates.current);
  }, []);

  // our new doCrop takes the exact CropState you want it to save
  const doCrop = useCallback(
    async (idx: number, area: Area, cs: CropState) => {
      const src = originalPreviews[idx];
      const blob = await getCroppedImg(src, area);
      const file = new File([blob], `cropped-${idx}.jpg`, { type: blob.type });
      replaceFile(idx, file);
      setPreviews((prev) => {
        URL.revokeObjectURL(prev[idx]);
        const next = [...prev];
        next[idx] = URL.createObjectURL(blob);
        return next;
      });
      // *persist exactly* the CS you passed in
      saveCrop(idx, { ...cs, area });
    },
    [originalPreviews, replaceFile, saveCrop]
  );

  return {
    files,
    previews,
    originalPreviews,
    aspects,
    cropStates,

    addFiles,
    replaceFile,
    removeFile,
    clearAll,

    openCrop,
    saveCrop,
    rollback,
    doCrop,
  };
}
