import React, { useState } from 'react';
import { Search, ChevronDown, Edit2, Trash2, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
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

export default function ArticleManagement({ articles: propArticles, onCreateClick, onEditClick, onDelete, sidebarOpen, setSidebarOpen }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const articles = propArticles || [];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || article.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = !categoryFilter || article.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(articleToDelete);
    }
    setShowDeleteModal(false);
    setArticleToDelete(null);
  };

  return (
    <div className="flex-1 bg-white min-h-screen pb-20 lg:pb-0">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 md:px-8 h-[56px] flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-base md:text-lg font-semibold text-stone-800 text-center flex-1 lg:text-left lg:flex-none">
            Article management
          </h1>
        </div>
        
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>

        {/* Create button only on desktop */}
        <button
          onClick={onCreateClick}
          className="hidden lg:flex bg-stone-800 text-white px-3 md:px-4 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors items-center justify-center gap-1.5"
        >
          <span className="text-base">+</span>
          <span>Create article</span>
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 md:px-8 py-4 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleFilterChange(setSearchQuery)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-stone-300 text-stone-700"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:flex-none">
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="appearance-none w-full md:w-auto pl-3 pr-8 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:border-stone-300 cursor-pointer"
            >
              <option value="">Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              value={categoryFilter}
              onChange={handleFilterChange(setCategoryFilter)}
              className="appearance-none w-full md:w-auto pl-3 pr-8 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:border-stone-300 cursor-pointer"
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

      {/* Table - Desktop */}
      <div className="hidden md:block px-8 pb-8">
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-200 px-5 py-2.5 grid grid-cols-12 gap-4 text-xs font-medium text-stone-600">
            <div className="col-span-6">Article title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2"></div>
          </div>

          {paginatedArticles.length === 0 ? (
            <div className="px-5 py-8 text-center text-stone-500 text-xs">No articles found</div>
          ) : (
            paginatedArticles.map((article, index) => (
              <div
                key={article.id}
                className={`border-b border-stone-200 last:border-b-0 px-5 py-3 grid grid-cols-12 gap-4 items-center transition-colors ${
                  index % 2 === 0 ? 'bg-white hover:bg-stone-50' : 'bg-stone-100 hover:bg-stone-100'
                }`}
              >
                <div className="col-span-6 text-xs text-stone-800">{article.title}</div>
                <div className="col-span-2 text-xs text-stone-600">{article.category}</div>
                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                    {article.status}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button onClick={() => onEditClick && onEditClick(article)} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                  </button>
                  <button onClick={() => handleDeleteClick(article)} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredArticles.length > 0 && (
          <div className="mt-5 flex items-center justify-between">
            <div className="text-xs text-stone-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-stone-600" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-stone-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden px-4 pb-4 space-y-3">
        {paginatedArticles.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-sm">No articles found</div>
        ) : (
          paginatedArticles.map((article) => (
            <div key={article.id} className="bg-white border border-stone-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-sm font-medium text-stone-800 flex-1">{article.title}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => onEditClick && onEditClick(article)} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-stone-500" />
                  </button>
                  <button onClick={() => handleDeleteClick(article)} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-stone-600">{article.category}</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                  {article.status}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {filteredArticles.length > 0 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-stone-600">
              {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-stone-600" />
              </button>
              
              <span className="text-xs text-stone-600 min-w-[60px] text-center">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-stone-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Action Bar - Create Article Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 z-20">
        <button
          onClick={onCreateClick}
          className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          Create article
        </button>
      </div>

      {/* Delete Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="bg-white rounded-2xl border-0 shadow-2xl max-w-sm p-8">
          <button onClick={() => setShowDeleteModal(false)} className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 transition-colors">
            <span className="text-xl leading-none">×</span>
          </button>
          
          <AlertDialogHeader className="text-center space-y-4 mb-6">
            <AlertDialogTitle className="text-2xl font-bold text-stone-900">Delete article</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-stone-600">Do you want to delete this article?</AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="sm:flex-row sm:justify-center gap-3 mt-0">
            <AlertDialogCancel className="mt-0 rounded-full border-2 border-stone-300 text-stone-700 hover:bg-stone-50 px-10 py-3 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="rounded-full bg-stone-900 text-white hover:bg-stone-800 px-10 py-3 font-medium">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}