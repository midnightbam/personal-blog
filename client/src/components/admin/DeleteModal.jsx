import React from 'react';
import { X } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="px-6 md:px-8 py-8 md:py-10 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-stone-800 mb-4">
            {title || 'Delete article'}
          </h2>
          <p className="text-sm md:text-base text-stone-600 mb-8">
            {message || 'Do you want to delete this article?'}
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full px-6 py-3 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white text-stone-700 rounded-full text-sm font-medium border border-stone-300 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}