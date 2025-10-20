import React from 'react';
import { X } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="px-8 py-8 text-center">
          <h2 className="text-xl font-semibold text-stone-800 mb-3">
            {title || 'Delete article'}
          </h2>
          <p className="text-sm text-stone-600 mb-6">
            {message || 'Do you want to delete this article?'}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white text-stone-700 rounded-full text-sm font-medium border border-stone-300 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}