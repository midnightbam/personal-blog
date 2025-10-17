import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Check, ChevronDown } from 'lucide-react';

// ========== BLOG CARD COMPONENT ==========
function BlogCard({ id, image, category, title, description, author, date }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Clickable Image */}
      <Link to={`/post/${id}`} className="relative h-[212px] sm:h-[360px]">
        <img 
          className="w-full h-full object-cover rounded-md hover:opacity-90 transition-opacity" 
          src={image} 
          alt={title}
        />
      </Link>
      
      <div className="flex flex-col">
        <div className="flex">
          <span className="bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-green-600 mb-2">
            {category}
          </span>
        </div>
        
        {/* Clickable Title */}
        <Link to={`/post/${id}`}>
          <h2 className="text-start font-bold text-xl mb-2 line-clamp-2 hover:underline cursor-pointer">
            {title}
          </h2>
        </Link>
        
        <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center text-sm">
          <img 
            className="w-8 h-8 rounded-full mr-2" 
            src="https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg" 
            alt={author} 
          />
          <span>{author}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}

// ========== SELECT COMPONENTS ==========
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

// ========== UTILITY FUNCTION ==========
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

// ========== MAIN COMPONENT ==========
const ArticleSection = () => {
  const categories = ["Highlight", "Cat", "Inspiration", "General"];
  const [selectedCategory, setSelectedCategory] = useState("Highlight");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchPosts = async (currentPage, shouldReset = false, category) => {
    setIsLoading(true);
    
    try {
      const categoryParam = category === "Highlight" ? "" : category;
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '6',
        ...(categoryParam && { category: categoryParam })
      });
      
      const response = await fetch(
        `https://blog-post-project-api.vercel.app/posts?${params}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      
      const formattedPosts = data.posts.map(post => ({
        ...post,
        date: formatDate(post.date)
      }));
      
      // Replace posts if shouldReset is true, otherwise append
      setPosts(shouldReset ? formattedPosts : (prevPosts) => [...prevPosts, ...formattedPosts]);
      
      setHasMore(data.currentPage < data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // When category changes - reset and load first page
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true, selectedCategory);
  }, [selectedCategory]);

  // When page changes (from View More button only)
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, false, selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleCategoryChange = (category) => {
    if (category !== selectedCategory) {
      setSelectedCategory(category);
    }
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

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
                  onClick={() => handleCategoryChange(category)}
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

        {/* Mobile Layout */}
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

          {/* Category Select */}
          <div>
            <label className="block text-[#75716B] text-sm mb-2">Category</label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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

        {/* Loading State (Initial Load or Category Change) */}
        {isLoading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-12 py-8">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm mt-4">Loading...</p>
          </div>
        )}

        {/* Blog Cards Grid */}
        {!isLoading && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {posts.map((post) => (
                <BlogCard
                  key={`${post.id}-${post.date}`}
                  id={post.id}
                  image={post.image}
                  category={post.category}
                  title={post.title}
                  description={post.description}
                  author={post.author}
                  date={post.date}
                />
              ))}
            </div>

            {/* View More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="hover:text-muted-foreground font-medium underline"
                >
                  View more
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State (When loading more posts) */}
        {isLoading && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {posts.map((post) => (
                <BlogCard
                  key={`${post.id}-${post.date}`}
                  id={post.id}
                  image={post.image}
                  category={post.category}
                  title={post.title}
                  description={post.description}
                  author={post.author}
                  date={post.date}
                />
              ))}
            </div>
            
            <div className="flex flex-col items-center justify-center mt-8 py-8">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm mt-4">Loading...</p>
            </div>
          </>
        )}

        {/* No Posts Message */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 text-lg">No articles found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticleSection;