import React, { useState } from 'react';
import { Search, ChevronDown, Edit2, Trash2 } from 'lucide-react';
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

export default function ArticleManagement({ onCreateClick, onEditClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const articles = [
    {
      id: 1,
      title: "Understanding Cat Behavior: Why Your Feline Friend Acts the Way They D...",
      category: "Cat",
      status: "Published"
    },
    {
      id: 2,
      title: "The Fascinating World of Cats: Why We Love Our Furry Friends",
      category: "Cat",
      status: "Published"
    },
    {
      id: 3,
      title: "Finding Motivation: How to Stay Inspired Through Life's Challenges",
      category: "General",
      status: "Published"
    },
    {
      id: 4,
      title: "The Science of the Cat's Purr: How It Benefits Cats and Humans Alike",
      category: "Cat",
      status: "Published"
    },
    {
      id: 5,
      title: "Top 10 Health Tips to Keep Your Cat Happy and Healthy",
      category: "Cat",
      status: "Published"
    },
    {
      id: 6,
      title: "Unlocking Creativity: Simple Habits to Spark Inspiration Daily",
      category: "Inspiration",
      status: "Published"
    }
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || article.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = !categoryFilter || article.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting article:', articleToDelete);
    setShowDeleteModal(false);
    setArticleToDelete(null);
  };

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Navbar */}
      <div className="bg-white border-b border-stone-200 px-8 h-[56px] flex items-center justify-between">
  <h1 className="text-lg font-semibold text-stone-800">Article management</h1>
  <button
    onClick={onCreateClick}
    className="bg-stone-800 text-white min-w-[140px] px-4 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-1.5"
  >
    <span className="text-base">+</span>
    Create article
  </button>
</div>

      {/* Filters */}
      <div className="px-8 py-5 flex items-center justify-between gap-4">
        {/* Search - Left side */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-stone-300 text-stone-700"
          />
        </div>

        {/* Filters - Right side */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:border-stone-300 cursor-pointer min-w-[120px]"
            >
              <option value="">Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:border-stone-300 cursor-pointer min-w-[120px]"
            >
              <option value="">Category</option>
              <option value="cat">Cat</option>
              <option value="general">General</option>
              <option value="inspiration">Inspiration</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 pb-8">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-stone-50 border-b border-stone-200 px-5 py-2.5 grid grid-cols-12 gap-4 text-xs font-medium text-stone-600">
            <div className="col-span-6">Article title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2"></div>
          </div>

          {/* Table Body */}
          {filteredArticles.length === 0 ? (
            <div className="px-5 py-8 text-center text-stone-500 text-xs">
              No articles found
            </div>
          ) : (
            filteredArticles.map((article, index) => (
              <div
                key={article.id}
                className={`border-b border-stone-200 last:border-b-0 px-5 py-3 grid grid-cols-12 gap-4 items-center transition-colors ${
                  index % 2 === 0 ? 'bg-white hover:bg-stone-50' : 'bg-stone-100 hover:bg-stone-100'
                }`}
              >
                <div className="col-span-6 text-xs text-stone-800">
                  {article.title}
                </div>
                <div className="col-span-2 text-xs text-stone-600">
                  {article.category}
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                    {article.status}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onEditClick && onEditClick(article)}
                    className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(article)}
                    className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                </div>
              </div>
            ))
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
              onClick={handleDeleteConfirm}
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