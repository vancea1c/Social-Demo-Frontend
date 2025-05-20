import React from "react";

type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  text?: string;
};

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  text = "Are you sure you want to delete this?",
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl w-full max-w-xs">
        <div className="mb-4 text-lg text-center">{text}</div>
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            No
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirm();
            }}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
