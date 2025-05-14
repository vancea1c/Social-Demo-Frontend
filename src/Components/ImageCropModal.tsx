import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { ArrowLeft } from "react-feather";
import { getCroppedImg } from "../utils/cropImage";

interface ImageCropModalProps {
  imageSrc: string;
  aspect: number;
  onCancel: () => void;
  onApply: (cropped: Blob) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageSrc,
  aspect,
  onCancel,
  onApply,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback(
    (_: Area, pixels: Area) => setCroppedAreaPixels(pixels),
    []
  );

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onApply(blob);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={{ backdropFilter: "blur(3px)" }}
    >
      <div
        className="relative bg-black rounded-xl overflow-hidden shadow-2xl"
        style={{ width: 500, height: 500 }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
          <button onClick={onCancel} className="p-1">
            <ArrowLeft color="white" size={20} />
          </button>
          <h3 className="text-white text-lg font-medium">Edit media</h3>
          <button
            onClick={handleApply}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Apply
          </button>
        </div>

        {/* CROPPER */}
        <div className="relative w-full h-[calc(100%-96px)] bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { maxHeight: 400 },
              mediaStyle: { objectFit: "contain" },
            }}
          />
        </div>

        {/* ZOOM SLIDER */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center">
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
  );
};

export default ImageCropModal;
