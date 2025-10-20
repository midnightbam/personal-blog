import React, { useState } from 'react';
import { Image, ChevronDown, ArrowLeft } from 'lucide-react';
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

export default function ArticleForm({ mode = 'create', articleData = null, onBack, onDelete }) {
  const [formData, setFormData] = useState({
    thumbnail: articleData?.thumbnail || null,
    category: articleData?.category || '',
    authorName: articleData?.authorName || '',
    title: articleData?.title || '',
    introduction: articleData?.introduction || '',
    content: articleData?.content || ''
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

  const handleBack = (e) => {
    e.preventDefault();
    if (onBack) {
      onBack();
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving as draft:', formData);
    alert('Create article and saved as draft');
  };

  const handleSavePublish = () => {
    console.log('Saving and publishing:', formData);
    alert('Create article and published');
  };

  const handleSave = () => {
    console.log('Saving changes:', formData);
    alert('Article updated');
  };

  const handleDelete = () => {
    console.log('Deleting article');
    setShowDeleteModal(false);
    if (onDelete) {
      onDelete(articleData?.id);
    }
    alert('Article deleted');
  };

  return (
    <div className="flex-1 bg-stone-100 min-h-screen">
      {/* Navbar */}
<div className="bg-white border-b border-stone-200 px-8 h-[56px] flex items-center justify-between">
  <div className="flex items-center gap-4">
    <button
      onClick={onBack}
      className="text-stone-600 hover:text-stone-800 transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
    <h1 className="text-lg font-semibold text-stone-800">
      {mode === 'create' ? 'Create article' : 'Edit article'}
    </h1>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={handleSaveDraft}
      className="bg-white text-stone-700 px-4 py-2 rounded-full text-xs font-medium border border-stone-300 hover:bg-stone-50 transition-colors min-w-[120px]"
    >
      Save as draft
    </button>
    <button
      onClick={mode === 'create' ? handleSavePublish : handleSave}
      className="bg-stone-800 text-white min-w-[140px] px-4 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors"
    >
      {mode === 'create' ? 'Save and publish' : 'Save'}
    </button>
  </div>
</div>


      {/* Form Content */}
      <div className="px-8 py-8 max-w-4xl">
        {/* Thumbnail Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Thumbnail image
          </label>
          <div className="space-y-4">
            {/* Preview Box */}
            <div className="w-full">
              {!thumbnailPreview ? (
                <div className="bg-stone-200 rounded-lg w-full h-56 flex items-center justify-center">
                  <Image className="w-12 h-12 text-stone-400" />
                </div>
              ) : (
                <div className="bg-stone-200 rounded-lg w-full h-56 overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            {/* Upload Button */}
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
                {thumbnailPreview ? 'Upload thumbnail image' : 'Upload thumbnail image'}
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
              <option value="cat">Cat</option>
              <option value="general">General</option>
              <option value="inspiration">Inspiration</option>
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

        {/* Delete Button - Only show in edit mode */}
        {mode === 'edit' && (
          <div className="mb-6">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-100 transition-colors"
            >
              Delete article
            </button>
          </div>
        )}
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