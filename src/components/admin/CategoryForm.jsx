import React, { useState } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { toast as sonnerToast } from "sonner";

const toastSuccess = (message, description = "") => {
  sonnerToast.success(message, {
    description,
    duration: 4000,
    position: "top-center",
    style: {
      background: '#12B279',
      color: 'white',
      border: 'none',
    },
    classNames: {
      description: '!text-white',
      closeButton: '!bg-transparent !text-white hover:!bg-white/10 !absolute !right-1 !left-auto !top-4',
    },
    closeButton: true,
  });
};

export default function CategoryForm({ mode = 'create', categoryData = null, onSave, onBack, sidebarOpen, setSidebarOpen }) {
  const [categoryName, setCategoryName] = useState(categoryData?.name || '');

  const handleSave = () => {
    if (categoryName.trim()) {
      const categoryToSave = {
        id: categoryData?.id || Date.now(),
        name: categoryName.trim()
      };
      
      if (onSave) {
        onSave(categoryToSave);
      }

      toastSuccess(
        mode === 'create' ? "Category created" : "Category updated",
        mode === 'create' 
          ? "Your new category has been added successfully" 
          : "Category changes have been saved successfully"
      );

      setTimeout(() => {
        if (onBack) onBack();
      }, 1000);
    }
  };

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 md:px-8 h-[56px] flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <button
            onClick={onBack}
            className="lg:hidden text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onBack}
            className="hidden lg:block text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-stone-800 text-center flex-1 lg:text-left lg:flex-none">
            {mode === 'create' ? 'Create category' : 'Edit category'}
          </h1>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={handleSave}
            className="bg-stone-800 text-white px-4 md:px-6 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors min-w-[80px] md:min-w-[100px]"
          >
            Save
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Category name
          </label>
          <input
            type="text"
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
          />
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 z-20">
        <button
          onClick={handleSave}
          className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}