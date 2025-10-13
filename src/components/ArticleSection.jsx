import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, ChevronDown } from 'lucide-react'; // Add Check and ChevronDown
import BlogCard from './BlogCard';
import blogPosts from '../data/blogPosts';

// ========== ADD THESE SELECT COMPONENTS ==========
// Shadcn-style Select Component
const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div ref={selectRef} className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { isOpen, setIsOpen, value });
        }
        if (child.type === SelectContent) {
          return isOpen ? React.cloneElement(child, { value, onValueChange, setIsOpen }) : null;
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ isOpen, setIsOpen, value }) => (
  <button
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-[#75716B] text-sm text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
  >
    <span>{value}</span>
    <ChevronDown className={`text-[#75716B] transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
  </button>
);

const SelectContent = ({ value, onValueChange, setIsOpen, children }) => (
  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
    {React.Children.map(children, child => 
      React.cloneElement(child, { 
        selectedValue: value, 
        onValueChange, 
        setIsOpen 
      })
    )}
  </div>
);

const SelectItem = ({ value, selectedValue, onValueChange, setIsOpen, children }) => {
  const isSelected = value === selectedValue;
  
  return (
    <div
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className={`px-4 py-2.5 cursor-pointer flex items-center gap-2 hover:bg-gray-100 transition-colors ${
        isSelected ? 'bg-gray-100' : ''
      }`}
    >
      {isSelected && <Check size={16} className="text-gray-900 flex-shrink-0" strokeWidth={2.5} />}
      <span className={`text-gray-900 text-sm ${!isSelected ? 'ml-6' : ''}`}>{children}</span>
    </div>
  );
};
// ========== END SELECT COMPONENTS ==========

const ArticleSection = () => {
  const categories = ["Highlight", "Cat", "Inspiration", "General"];
  const [selectedCategory, setSelectedCategory] = useState("Highlight");

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto w-full">
        {/* Title */}
         
        <h3 className="text-2xl sm:text-3xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-12">
        Latest articles
        </h3>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="bg-[#EFEEEB] rounded-2xl shadow-sm p-4 flex items-center justify-between gap-6">
            {/* Category Buttons */}
            <div className="flex items-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#DAD6D1] text-[#43403B]'
                      : 'bg-[#EFEEEB] text-[#75716B] hover:bg-[#DAD6D1] hover:text-[#43403B]'
                  }`}
                >
                  {category}
                </button>
              ))}
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

        {/* Mobile Layout - REPLACE YOUR MOBILE SECTION WITH THIS */}
        <div className="lg:hidden -mx-4 sm:-mx-6 md:-mx-8 bg-[#EFEEEB] px-4 sm:px-6 md:px-8 py-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 text-[#75716B] placeholder:text-[#75716B] text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75716B]" size={18} />
          </div>

          {/* Category Section with Shadcn Select */}
          <div>
            <label className="block text-[#75716B] text-sm mb-2">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger />
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blog Cards Grid */}
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