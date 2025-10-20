import React, { useState } from 'react';
import { Search, Edit2, Trash2, ArrowLeft } from 'lucide-react';

export default function CategoryManagement({ categories, onCreateClick, onEditClick, onDelete, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-stone-100 min-h-screen">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-8 h-[56px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-stone-600 hover:text-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-stone-800">Category management</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCreateClick}
            className="bg-stone-800 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Create category
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-6xl">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-400"
            />
          </div>
        </div>

        {/* Category List */}
        <div className="bg-white rounded-lg border border-stone-300 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-3 bg-stone-100 border-b border-stone-300">
            <p className="text-sm font-medium text-stone-700">Category</p>
          </div>

          {/* List Items */}
          <div className="divide-y divide-stone-200">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
              >
                <span className="text-sm text-stone-800">{category.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditClick(category)}
                    className="p-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}