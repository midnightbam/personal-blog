import React, { useState } from 'react';
import { Search, Edit2, Trash2, Menu } from 'lucide-react';
import DeleteModal from './DeleteModal';

export default function CategoryManagement({ categories, onCreateClick, onEditClick, onDelete, sidebarOpen, setSidebarOpen, deleteModalOpen, setDeleteModalOpen, itemToDelete, onConfirmDelete }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-white min-h-screen pb-20 lg:pb-0">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 md:px-8 h-[56px] flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-base md:text-lg font-semibold text-stone-800 text-center flex-1 lg:text-left lg:flex-none">
            Category management
          </h1>
        </div>
        
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>

        <button
          onClick={onCreateClick}
          className="hidden lg:flex bg-stone-800 text-white px-3 md:px-4 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors items-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          <span>Create category</span>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-6 md:py-8">
        {/* Search */}
        <div className="mb-6 w-full md:max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-stone-300 text-stone-700"
            />
          </div>
        </div>

        {/* Category List - Desktop */}
        <div className="hidden md:block bg-white border border-stone-200 rounded-lg overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-200 px-5 py-2.5">
            <p className="text-xs font-medium text-stone-600">Category</p>
          </div>

          <div className="divide-y divide-stone-200">
            {filteredCategories.length === 0 ? (
              <div className="px-5 py-8 text-center text-stone-500 text-xs">
                No categories found
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors"
                >
                  <span className="text-xs text-stone-800">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditClick(category)}
                      className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                    </button>
                    <button
                      onClick={() => onDelete(category)}
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

        {/* Category Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center text-stone-500 text-sm">
              No categories found
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white border border-stone-200 rounded-lg p-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
              >
                <span className="text-sm text-stone-800 font-medium">{category.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditClick(category)}
                    className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-stone-500" />
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 z-20">
        <button
          onClick={onCreateClick}
          className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          Create category
        </button>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
        title="Delete category"
        message="Do you want to delete this category?"
      />
    </div>
  );
}