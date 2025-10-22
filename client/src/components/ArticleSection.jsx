import { useEffect, useState, useCallback } from "react";
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
import { supabase } from "@/lib/supabase";

export default function Articles() {
  const [allCategories, setAllCategories] = useState([]);
  const [category, setCategory] = useState("Highlight");
  const [allPosts, setAllPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Constants for pagination
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch categories and initial articles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch both categories and initial articles in parallel
        const [categoriesResponse, articlesResponse] = await Promise.all([
          supabase
            .from('categories')
            .select('name')
            .order('name', { ascending: true }),
          supabase
            .from('articles')
            .select('*', { count: 'exact' })
            .eq('status', 'Published')
            .order('date', { ascending: false })
            .range(0, ITEMS_PER_PAGE - 1)
        ]);

        if (categoriesResponse.error) throw categoriesResponse.error;
        if (articlesResponse.error) throw articlesResponse.error;

        const categoryNames = categoriesResponse.data?.map(cat => cat.name) || [];
        setAllCategories(["Highlight", ...categoryNames]);

        setAllPosts(articlesResponse.data || []);
        setHasMore(articlesResponse.data.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAllPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (value) => {
    if (value !== category) {
      setCategory(value);
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (isFetchingMore || !hasMore) return;

    try {
      setIsFetchingMore(true);
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'Published')
        .order('date', { ascending: false })
        .range(from, to);

      if (category !== "Highlight") {
        query.eq('category', category);
      }

      if (searchQuery.trim()) {
        query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setAllPosts(prev => [...prev, ...data]);
        setHasMore(data.length === ITEMS_PER_PAGE);
        setCurrentPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [category, searchQuery, currentPage, hasMore, isFetchingMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingMore && hasMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, loadMorePosts]);

  if (isLoading) {
    return (
      <section className="bg-gray-50 py-8 lg:py-10 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-3" />
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-8 lg:py-10">
      <div className="mx-auto px-4 max-w-7xl">
        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
          Latest articles
        </h3>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="bg-[#EFEEEB] rounded-xl shadow-sm p-3 flex items-center justify-between gap-4">
            {/* Category Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  disabled={category === cat}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
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
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 pr-9 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-900"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden -mx-4 sm:-mx-6 md:-mx-8 bg-[#EFEEEB] px-4 sm:px-6 md:px-8 py-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pr-9 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 text-[#75716B] placeholder:text-[#75716B] text-sm"
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#75716B]" size={16} />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-[#75716B] text-xs mb-1.5">Category</label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-[#75716B] text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="flex items-center gap-2">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blog Cards Grid */}
        {allPosts.length > 0 ? (
          <article className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {allPosts.map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                image={blog.thumbnail}
                category={blog.category}
                title={blog.title}
                description={blog.description}
                author={blog.author_name}
                date={new Date(blog.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
            ))}
            
            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div
                id="load-more-trigger"
                className="col-span-full flex justify-center p-4"
              >
                {isFetchingMore ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <div className="h-10" aria-hidden="true" />
                )}
              </div>
            )}
          </article>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found.</p>
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
    <div className="flex flex-col gap-3">
      <button
        onClick={handleClick}
        className="relative h-[180px] sm:h-[280px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded-md overflow-hidden group"
      >
        <img
          className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
          src={image}
          alt={title}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300";
          }}
        />
      </button>
      <div className="flex flex-col">
        <div className="flex">
          <span className="bg-green-200 rounded-full px-2.5 py-0.5 text-xs font-semibold text-green-600 mb-2">
            {category}
          </span>
        </div>
        <button 
          onClick={handleClick}
          className="text-start focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded"
        >
          <h2 className="font-bold text-lg mb-1.5 line-clamp-2 hover:underline">
            {title}
          </h2>
        </button>
        <p className="text-muted-foreground text-sm mb-3 flex-grow line-clamp-2">
          {description}
        </p>
        <div className="flex items-center text-xs text-gray-600">
          <img
            className="w-7 h-7 rounded-full mr-2"
            src="https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg"
            alt={author}
          />
          <span className="font-medium">{author}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}