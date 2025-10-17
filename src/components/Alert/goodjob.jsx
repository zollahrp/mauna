import React from "react";
import gifUrl from "/images/crop-goodjob.gif";
export default function AlertPopup({ open, onClose, message = "Goodjob" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-xs relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Tutup"
        >
          x
        </button>
        <img
          src={gifUrl}
          alt="Goodjob"
          className="w-32 h-32 object-contain mb-4"
        />
        <div className="text-xl font-bold text-[#32cd32] text-center">{message}</div>
      </div>
    </div>
  );
}