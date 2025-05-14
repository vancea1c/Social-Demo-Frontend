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
  area?: Area;
}

export default function useMediaManager({
  maxFiles = 4,
  maxVideoSizeBytes = 256 * 1024 * 1024,
}: MediaManagerOptions = {}) {
  // Lista de fișiere efective (posibil cropate)
  const [files, setFiles] = useState<File[]>([]);
  // Previews pentru fișiere (pentru afișare)
  const [previews, setPreviews] = useState<string[]>([]);

  // Originale încărcate inițial, folosite ca sursă pentru crop
  const [originalPreviews, setOriginalPreviews] = useState<string[]>([]);
  // Aspect ratio al imaginilor originale
  const [aspects, setAspects] = useState<number[]>([]);

  // Stările de crop per imagine (working state)
  const [cropStates, setCropStates] = useState<(CropState | undefined)[]>([]);
  // Backup state pentru undo
  const backupCropStates = useRef<(CropState | undefined)[]>([]);

  // Când se adaugă fișiere noi: setăm originals + aspects, iar previews se calculează din files
  const addFiles = useCallback(
    (selected: File[]) => {
      // Filtrare video mari
      const valid = selected.filter(
        (f) => !(f.type.startsWith("video/") && f.size > maxVideoSizeBytes)
      );
      if (!valid.length) return;

      // Creăm URL-uri pentru originals și calculăm aspect
      const newOriginalUrls = valid.map((f) => URL.createObjectURL(f));
      setOriginalPreviews((prev) =>
        [...prev, ...newOriginalUrls].slice(0, maxFiles)
      );
      // Calcule aspect ratio
      Promise.all(newOriginalUrls.map(getImageAspect))
        .then((newAspects) => {
          setAspects((prev) => [...prev, ...newAspects].slice(0, maxFiles));
        })
        .catch(() => {
          /* ignorăm erorile */
        });

      // Actualizăm files și resetăm cropStates pentru noile intrări
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

  // Când files se schimbă: regenerează previews și revocă URL-urile vechi
  useEffect(() => {
    previews.forEach(URL.revokeObjectURL);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  }, [files]);

  // Cleanup URL-uri la demontare
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
    // previews vor fi regenerate de useEffect
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
      // Salvăm snapshot-ul curent pentru undo
      backupCropStates.current = cropStates.slice();
    },
    [cropStates]
  );

  const saveCrop = useCallback((idx: number, state: CropState) => {
    setCropStates((prev) => {
      const next = [...prev];
      next[idx] = state;
      return next;
    });
  }, []);

  const rollback = useCallback(() => {
    setCropStates(backupCropStates.current);
  }, []);

  const doCrop = useCallback(
    async (idx: number, area: Area) => {
      // Folosim imaginea originală pentru decupare
      const src = originalPreviews[idx];
      const blob = await getCroppedImg(src, area);
      const file = new File([blob], `cropped-${idx}.jpg`, { type: blob.type });
      replaceFile(idx, file);
      // actualizăm preview-ul imediat
      setPreviews((prev) => {
        URL.revokeObjectURL(prev[idx]);
        const next = [...prev];
        next[idx] = URL.createObjectURL(blob);
        return next;
      });
      // salvăm noul state de crop
      saveCrop(idx, {
        crop: cropStates[idx]?.crop ?? { x: 0, y: 0 },
        zoom: cropStates[idx]?.zoom ?? 1,
        aspect: cropStates[idx]?.aspect ?? aspects[idx],
        area,
      });
    },
    [originalPreviews, replaceFile, saveCrop, cropStates, aspects]
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
