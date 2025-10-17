/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function Articles() {
  const categories = ["Highlight", "Cat", "Inspiration", "General"];
  const [category, setCategory] = useState("Highlight");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch posts function with better error handling
  const fetchPosts = async (currentPage, shouldReset = false) => {
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
      
      // Update posts - reset or append
      if (shouldReset) {
        setPosts(data.posts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      }
      
      // Check if there are more posts to load
      setHasMore(data.currentPage < data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category changes - reset everything
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Handle page changes (load more)
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleCategoryChange = (value) => {
    if (value !== category) {
      setCategory(value);
    }
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
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  disabled={category === cat}
                  className={`px-6 py-2.5 font-medium rounded-lg transition-colors ${
                    category === cat
                      ? 'bg-[#DAD6D1] text-[#43403B]'
                      : 'bg-[#EFEEEB] text-[#75716B] hover:bg-[#DAD6D1] hover:text-[#43403B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-80">
              <Input
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
            <Input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 text-[#75716B] placeholder:text-[#75716B] text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75716B]" size={18} />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-[#75716B] text-sm mb-2">Category</label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-[#75716B] text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="flex items-center gap-2">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Initial Loading State */}
        {isLoading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Blog Cards Grid */}
        {posts.length > 0 && (
          <>
            <article className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {posts.map((blog, index) => (
                <BlogCard
                  key={`${blog.id}-${index}`}
                  id={blog.id}
                  image={blog.image}
                  category={blog.category}
                  title={blog.title}
                  description={blog.description}
                  author={blog.author}
                  date={new Date(blog.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
              ))}
            </article>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="hover:text-gray-600 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "View more"}
                </button>
              </div>
            )}
          </>
        )}

        {/* No Posts Message */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No articles found.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function BlogCard({ id, image, category, title, description, author, date }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/post/${id}`);
  };
  
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleClick}
        className="relative h-[212px] sm:h-[360px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded-md"
      >
        <img
          className="w-full h-full object-cover rounded-md"
          src={image}
          alt={title}
        />
      </button>
      <div className="flex flex-col">
        <div className="flex">
          <span className="bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-green-600 mb-2">
            {category}
          </span>
        </div>
        <button 
          onClick={handleClick}
          className="text-start focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded"
        >
          <h2 className="font-bold text-xl mb-2 line-clamp-2 hover:underline">
            {title}
          </h2>
        </button>
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