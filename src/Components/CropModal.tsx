import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { ArrowLeft, ArrowRight, X } from "react-feather";

export interface CropModalProps {
  imageSrc: string;
  title?: string;
  initialAspect: number;
  ratioOptions: { label: string; value: number }[];
  initialCrop?: { x: number; y: number };
  initialZoom?: number;
  onCancel: () => void;
  onApply: (state: {
    crop: { x: number; y: number };
    zoom: number;
    aspect: number;
    area: Area;
  }) => void;
  canPrev?: boolean;
  canNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onSaveState?: (state: {
    crop: { x: number; y: number };
    zoom: number;
    aspect: number;
    area: Area | null;
  }) => void;
  applyLabel?: string;
}

const CropModal: React.FC<CropModalProps> = ({
  imageSrc,
  title = "Crop Image",
  initialAspect = 1,
  ratioOptions,
  initialCrop = { x: 0, y: 0 },
  initialZoom = 1,
  onCancel,
  onApply,
  canPrev = false,
  canNext = false,
  onPrev,
  onNext,
  onSaveState,
  applyLabel = "Save",
}) => {
  const [area, setArea] = useState<Area | null>(null);
  const [crop, setCrop] = useState(initialCrop);
  const [zoom, setZoom] = useState(initialZoom);
  const [aspect, setAspect] = useState(initialAspect);

  const handleComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={{ backdropFilter: "blur(3px)" }}
    >
      <div className="bg-black rounded-xl overflow-hidden shadow-xl w-[600px] h-[480px] flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <button onClick={onCancel}>
            <X color="white" size={20} />
          </button>
          <h2 className="text-white text-lg font-medium">{title}</h2>
          <button
            disabled={!area}
            onClick={() => {
              onSaveState?.({ crop, zoom, aspect, area });
              onApply({
                crop,
                zoom,
                aspect,
                area: area!,
              });
            }}
            className="px-4 py-1 bg-blue-600 rounded disabled:opacity-50 text-white"
          >
            {applyLabel}
          </button>
        </div>

        <div className="flex-grow w-full h-full relative bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleComplete}
            style={{
              containerStyle: { width: "100%", height: "100%" },
              mediaStyle: { objectFit: "contain" },
            }}
          />
          {canPrev && onPrev && (
            <button
              onClick={() => {
                onSaveState?.({ crop, zoom, aspect, area });
                onPrev();
              }}
              className="absolute left-2 top-1/2"
            >
              <ArrowLeft color="white" size={24} />
            </button>
          )}
          {canNext && onNext && (
            <button
              onClick={() => {
                onSaveState?.({ crop, zoom, aspect, area });
                onNext();
              }}
              className="absolute right-2 top-1/2"
            >
              <ArrowRight color="white" size={24} />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2 p-3 bg-black border-t border-gray-700">
          {ratioOptions.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setAspect(value)}
              className={`px-3 py-1 rounded ${
                aspect === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default CropModal;
