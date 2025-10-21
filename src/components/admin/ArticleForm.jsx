import React, { useState } from 'react';
import { Image, ChevronDown, ArrowLeft, Menu } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

export default function ArticleForm({ mode = 'create', articleData = null, onBack, onSave, onDelete, sidebarOpen, setSidebarOpen }) {
  const [formData, setFormData] = useState({
    id: articleData?.id || null,
    thumbnail: articleData?.thumbnail || null,
    category: articleData?.category || '',
    authorName: articleData?.authorName || '',
    title: articleData?.title || '',
    introduction: articleData?.introduction || '',
    content: articleData?.content || '',
    status: articleData?.status || 'Published'
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(articleData?.thumbnail || null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
        setFormData({ ...formData, thumbnail: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSaveDraft = () => {
    const articleToSave = {
      ...formData,
      status: 'Draft'
    };

    if (onSave) {
      onSave(articleToSave);
    }

    toastSuccess(
      mode === 'create' ? "Create article and saved draft" : "Saved as draft",
      mode === 'create' ? "You can publish article later" : "Your article has been saved as draft"
    );

    setTimeout(() => {
      if (onBack) onBack();
    }, 1000);
  };

  const handleSavePublish = () => {
    const articleToSave = {
      ...formData,
      status: 'Published'
    };

    if (onSave) {
      onSave(articleToSave);
    }

    toastSuccess(
      "Create article and published",
      "Your article has been successfully published"
    );

    setTimeout(() => {
      if (onBack) onBack();
    }, 1000);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }

    toastSuccess(
      "Saved changes",
      "Your article changes have been saved successfully"
    );

    setTimeout(() => {
      if (onBack) onBack();
    }, 1000);
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    if (onDelete) {
      onDelete(articleData);
    }
    
    toastSuccess(
      "Article deleted",
      "Your article has been successfully deleted"
    );

    setTimeout(() => {
      if (onBack) onBack();
    }, 1000);
  };

  return (
    <div className="flex-1 bg-stone-100 min-h-screen pb-24 lg:pb-0">
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
            {mode === 'create' ? 'Create article' : 'Edit article'}
          </h1>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>

        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="bg-white text-stone-700 px-4 md:px-6 py-2 rounded-full text-xs font-medium border border-stone-300 hover:bg-stone-50 transition-colors"
          >
            Save as draft
          </button>
          <button
            onClick={mode === 'create' ? handleSavePublish : handleSave}
            className="bg-stone-800 text-white px-4 md:px-6 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors"
          >
            {mode === 'create' ? 'Save and publish' : 'Save'}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        {/* Thumbnail Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Thumbnail image
          </label>
          <div className="space-y-4">
            <div className="w-full">
              {!thumbnailPreview ? (
                <div className="bg-stone-200 rounded-lg w-full h-48 md:h-80 flex items-center justify-center">
                  <Image className="w-12 h-12 text-stone-400" />
                </div>
              ) : (
                <div className="bg-stone-200 rounded-lg w-full h-48 md:h-80 overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
              <label
                htmlFor="thumbnail"
                className="inline-flex items-center gap-2 bg-white text-stone-700 px-6 py-2.5 rounded-full text-sm font-medium border border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Upload thumbnail image
              </label>
            </div>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="mb-6 mt-8">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Category
          </label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="appearance-none w-full pl-4 pr-10 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-stone-400 cursor-pointer"
            >
              <option value="">Select category</option>
              <option value="Cat">Cat</option>
              <option value="General">General</option>
              <option value="Inspiration">Inspiration</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Author Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Author name
          </label>
          <input
            type="text"
            placeholder="Thompson P."
            value={formData.authorName}
            onChange={(e) => handleInputChange('authorName', e.target.value)}
            className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Title
          </label>
          <input
            type="text"
            placeholder="Article title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Introduction */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Introduction (max 120 letters)
          </label>
          <textarea
            placeholder="Introduction"
            value={formData.introduction}
            onChange={(e) => handleInputChange('introduction', e.target.value)}
            maxLength={120}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Content
          </label>
          <textarea
            placeholder="Content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>

        {/* Delete Button - Only show in edit mode - Desktop only */}
        {mode === 'edit' && (
          <div className="mb-6 hidden lg:block">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-100 transition-colors"
            >
              Delete article
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 z-20">
        <div className="flex flex-col gap-2">
          <button
            onClick={mode === 'create' ? handleSavePublish : handleSave}
            className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            {mode === 'create' ? 'Save and publish' : 'Save'}
          </button>
          <button
            onClick={handleSaveDraft}
            className="w-full bg-white text-stone-700 py-3 rounded-full text-sm font-medium border border-stone-300 hover:bg-stone-50 transition-colors"
          >
            Save as draft
          </button>
          {mode === 'edit' && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-200 hover:bg-red-100 transition-colors"
            >
              Delete article
            </button>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="bg-white rounded-2xl border-0 shadow-2xl max-w-sm p-8">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <span className="text-xl leading-none">×</span>
          </button>
          
          <AlertDialogHeader className="text-center space-y-4 mb-6">
            <AlertDialogTitle className="text-2xl font-bold text-stone-900">
              Delete article
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-stone-600">
              Do you want to delete this article?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="sm:flex-row sm:justify-center gap-3 mt-0">
            <AlertDialogCancel className="mt-0 rounded-full border-2 border-stone-300 text-stone-700 hover:bg-stone-50 px-10 py-3 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-full bg-stone-900 text-white hover:bg-stone-800 px-10 py-3 font-medium"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}