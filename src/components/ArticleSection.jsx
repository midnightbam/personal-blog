import React from 'react';
import { Search } from 'lucide-react';
import BlogCard from './BlogCard';
import blogPosts from '../data/blogPosts';

const ArticleSection = () => {
  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        {/* Title */}
        <h2 className="text-xl sm:text-4xl lg:text-2xl font-bold text-gray-900 mb-8 lg:mb-12">
          Latest articles
        </h2>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="bg-[#EFEEEB] rounded-2xl shadow-sm p-6 flex items-center justify-between gap-6">
            {/* Category Buttons */}
            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 font-medium rounded-lg transition-colors bg-[#DAD6D1] text-[#43403B]">
                Highlight
              </button>
              <button className="px-6 py-2.5 font-medium rounded-lg transition-colors bg-[#EFEEEB] text-[#75716B] hover:bg-[#DAD6D1] hover:text-[#43403B]">
                Cat
              </button>
              <button className="px-6 py-2.5 font-medium rounded-lg transition-colors bg-[#EFEEEB] text-[#75716B] hover:bg-[#DAD6D1] hover:text-[#43403B]">
                Inspiration
              </button>
              <button className="px-6 py-2.5 font-medium rounded-lg transition-colors bg-[#EFEEEB] text-[#75716B] hover:bg-[#DAD6D1] hover:text-[#43403B]">
                General
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-80">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-900"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-6 py-4 pr-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-900 text-lg shadow-sm"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          </div>

          {/* Category Label */}
          <div>
            <label className="block text-gray-500 font-medium mb-3 text-lg">Category</label>
            {/* Category Dropdown */}
            <div className="relative">
              <select className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-600 text-lg appearance-none shadow-sm">
                <option>Highlight</option>
                <option>Cat</option>
                <option>Inspiration</option>
                <option>General</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Blog Cards Grid - ส่วนที่เพิ่มเข้ามาใหม่ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {blogPosts.map((post) => (
            <BlogCard
              key={post.id}
              image={post.image}
              category={post.category}
              title={post.title}
              description={post.description}
              author={post.author}
              date={post.date}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticleSection;