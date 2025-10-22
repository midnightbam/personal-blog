import React, { useState, useEffect, useRef } from 'react';
import { Image, ChevronDown, ArrowLeft, Menu, Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
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
import { imageUploadService } from '@/services/imageUploadService';
import { supabase } from '@/lib/supabase';

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
    authorName: 'Punyanuch K.', // Locked author name
    title: articleData?.title || '',
    introduction: articleData?.introduction || '',
    content: articleData?.content || '',
    status: articleData?.status || 'Published'
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(articleData?.thumbnail || null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const contentRef = useRef(null);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories from Supabase...");
        
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name', { ascending: true });

        if (error) {
          console.error("Error fetching categories:", error);
          sonnerToast.error("Failed to load categories");
          setCategories([]);
        } else {
          console.log("Categories fetched:", data);
          setCategories(data || []);
        }
      } catch (err) {
        console.error("Exception fetching categories:", err);
        sonnerToast.error("Failed to load categories");
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize content editor with existing content
  useEffect(() => {
    if (contentRef.current && articleData?.content) {
      contentRef.current.innerHTML = articleData.content;
    }
  }, [articleData]);

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingThumbnail(true);
      console.log("Starting thumbnail upload...");

      const articleId = articleData?.id || `article-${Date.now()}`;
      const publicUrl = await imageUploadService.uploadArticleThumbnail(file, articleId);
      
      setThumbnailPreview(publicUrl);
      setFormData({ ...formData, thumbnail: publicUrl });
      sonnerToast.success("Thumbnail uploaded successfully");
      console.log("Thumbnail uploaded:", publicUrl);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      sonnerToast.error("Failed to upload thumbnail");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Rich text formatting functions
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    contentRef.current.focus();
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      setFormData({ ...formData, content: contentRef.current.innerHTML });
    }
  };

  const handleSaveDraft = async () => {
    try {
      setUploadingThumbnail(true);
      
      const articleToSave = {
        ...formData,
        status: 'Draft'
      };

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('articles')
          .insert([{
            title: articleToSave.title,
            description: articleToSave.introduction,
            content: articleToSave.content,
            thumbnail: articleToSave.thumbnail,
            category: articleToSave.category,
            author_name: articleToSave.authorName,
            status: articleToSave.status,
            date: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating draft:", error);
          sonnerToast.error("Failed to save draft");
          setUploadingThumbnail(false);
          return;
        }
      } else {
        const { data, error } = await supabase
          .from('articles')
          .update({
            title: articleToSave.title,
            description: articleToSave.introduction,
            content: articleToSave.content,
            thumbnail: articleToSave.thumbnail,
            category: articleToSave.category,
            author_name: articleToSave.authorName,
            status: articleToSave.status
          })
          .eq('id', formData.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating draft:", error);
          sonnerToast.error("Failed to save draft");
          setUploadingThumbnail(false);
          return;
        }
      }

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
    } catch (error) {
      console.error("Error saving draft:", error);
      sonnerToast.error("Failed to save draft");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSavePublish = async () => {
    if (!formData.title.trim()) {
      sonnerToast.error("Title is required");
      return;
    }

    try {
      setUploadingThumbnail(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        sonnerToast.error("You must be logged in");
        return;
      }
      
      const articleToSave = {
        ...formData,
        status: 'Published',
        user_id: user.id
      };

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('articles')
          .insert([{
            title: articleToSave.title,
            description: articleToSave.introduction,
            content: articleToSave.content,
            thumbnail: articleToSave.thumbnail,
            category: articleToSave.category,
            author_name: articleToSave.authorName,
            user_id: articleToSave.user_id,
            status: articleToSave.status,
            date: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating article:", error);
          sonnerToast.error("Failed to publish article");
          setUploadingThumbnail(false);
          return;
        }

        console.log("Article published:", data);
      } else {
        const { data, error } = await supabase
          .from('articles')
          .update({
            title: articleToSave.title,
            description: articleToSave.introduction,
            content: articleToSave.content,
            thumbnail: articleToSave.thumbnail,
            category: articleToSave.category,
            author_name: articleToSave.authorName,
            status: articleToSave.status
          })
          .eq('id', formData.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating article:", error);
          sonnerToast.error("Failed to update article");
          setUploadingThumbnail(false);
          return;
        }

        console.log("Article updated:", data);
      }

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
    } catch (error) {
      console.error("Error saving article:", error);
      sonnerToast.error("Failed to publish article");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSave = async () => {
    try {
      setUploadingThumbnail(true);

      const { data, error } = await supabase
        .from('articles')
        .update({
          title: formData.title,
          description: formData.introduction,
          content: formData.content,
          thumbnail: formData.thumbnail,
          category: formData.category,
          author_name: formData.authorName,
          status: formData.status
        })
        .eq('id', formData.id)
        .select()
        .single();

      if (error) {
        console.error("Error saving changes:", error);
        sonnerToast.error("Failed to save changes");
        setUploadingThumbnail(false);
        return;
      }

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
    } catch (error) {
      console.error("Error saving changes:", error);
      sonnerToast.error("Failed to save changes");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleDelete = async () => {
    try {
      setUploadingThumbnail(true);

      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleData.id);

      if (error) {
        console.error("Error deleting article:", error);
        sonnerToast.error("Failed to delete article");
        setUploadingThumbnail(false);
        return;
      }

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
    } catch (error) {
      console.error("Error deleting article:", error);
      sonnerToast.error("Failed to delete article");
    } finally {
      setUploadingThumbnail(false);
    }
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
            className="bg-white text-stone-700 px-4 md:px-6 py-2 rounded-full text-xs font-medium border border-stone-300 hover:bg-stone-50 transition-colors disabled:opacity-50"
            disabled={uploadingThumbnail}
          >
            Save as draft
          </button>
          <button
            onClick={mode === 'create' ? handleSavePublish : handleSave}
            className="bg-stone-800 text-white px-4 md:px-6 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
            disabled={uploadingThumbnail}
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
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300";
                    }}
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
                disabled={uploadingThumbnail}
              />
              <label
                htmlFor="thumbnail"
                className="inline-flex items-center gap-2 bg-white text-stone-700 px-6 py-2.5 rounded-full text-sm font-medium border border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
                style={{
                  pointerEvents: uploadingThumbnail ? "none" : "auto",
                  opacity: uploadingThumbnail ? 0.5 : 1
                }}
              >
                {uploadingThumbnail ? "Uploading..." : "Upload thumbnail image"}
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
              className="appearance-none w-full pl-4 pr-10 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 focus:outline-none focus:border-stone-400 cursor-pointer disabled:opacity-50"
              disabled={uploadingThumbnail || loadingCategories}
            >
              <option value="">{loadingCategories ? "Loading categories..." : "Select category"}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Author Name - Locked */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Author name
          </label>
          <input
            type="text"
            value="Punyanuch K."
            readOnly
            className="w-full px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg text-sm text-stone-600 cursor-not-allowed"
            title="Author name is locked"
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
            className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 disabled:opacity-50"
            disabled={uploadingThumbnail}
          />
        </div>

        {/* Introduction - Increased to 500 characters */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Introduction (max 500 characters)
          </label>
          <textarea
            placeholder="Write a brief introduction to your article..."
            value={formData.introduction}
            onChange={(e) => handleInputChange('introduction', e.target.value)}
            maxLength={500}
            rows={6}
            className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none disabled:opacity-50"
            disabled={uploadingThumbnail}
          />
          <div className="text-right text-xs text-stone-500 mt-1">
            {formData.introduction.length} / 500
          </div>
        </div>

        {/* Content with Rich Text Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Content
          </label>
          
          {/* Formatting Toolbar */}
          <div className="bg-white border border-stone-300 rounded-t-lg px-3 py-2 flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => applyFormat('bold')}
              className="p-2 hover:bg-stone-100 rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4 text-stone-600" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('italic')}
              className="p-2 hover:bg-stone-100 rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4 text-stone-600" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('underline')}
              className="p-2 hover:bg-stone-100 rounded transition-colors"
              title="Underline"
            >
              <Underline className="w-4 h-4 text-stone-600" />
            </button>
            <div className="w-px h-6 bg-stone-300 mx-1"></div>
            <button
              type="button"
              onClick={() => applyFormat('insertUnorderedList')}
              className="p-2 hover:bg-stone-100 rounded transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4 text-stone-600" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('insertOrderedList')}
              className="p-2 hover:bg-stone-100 rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4 text-stone-600" />
            </button>
          </div>

          {/* Content Editor */}
          <div
            ref={contentRef}
            contentEditable
            onInput={handleContentChange}
            className="w-full min-h-[300px] px-4 py-3 bg-white border border-t-0 border-stone-300 rounded-b-lg text-sm text-stone-700 focus:outline-none focus:border-stone-400 disabled:opacity-50"
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
            data-placeholder="Write your article content here... Use the toolbar above to format your text."
          />
          
          <style jsx>{`
            [contentEditable]:empty:before {
              content: attr(data-placeholder);
              color: #a8a29e;
            }
            [contentEditable] {
              outline: none;
            }
            [contentEditable] b,
            [contentEditable] strong {
              font-weight: 700;
            }
            [contentEditable] i,
            [contentEditable] em {
              font-style: italic;
            }
            [contentEditable] u {
              text-decoration: underline;
            }
            [contentEditable] ul {
              list-style-type: disc;
              padding-left: 1.5rem;
              margin: 0.5rem 0;
            }
            [contentEditable] ol {
              list-style-type: decimal;
              padding-left: 1.5rem;
              margin: 0.5rem 0;
            }
            [contentEditable] li {
              margin: 0.25rem 0;
            }
          `}</style>
        </div>

        {/* Delete Button - Only show in edit mode - Desktop only */}
        {mode === 'edit' && (
          <div className="mb-6 hidden lg:block">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
              disabled={uploadingThumbnail}
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
            className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50"
            disabled={uploadingThumbnail}
          >
            {mode === 'create' ? 'Save and publish' : 'Save'}
          </button>
          <button
            onClick={handleSaveDraft}
            className="w-full bg-white text-stone-700 py-3 rounded-full text-sm font-medium border border-stone-300 hover:bg-stone-50 transition-colors disabled:opacity-50"
            disabled={uploadingThumbnail}
          >
            Save as draft
          </button>
          {mode === 'edit' && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
              disabled={uploadingThumbnail}
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