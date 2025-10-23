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
import { supabase } from "@/lib/supabase";
import BlogCard from "./BlogCard";

export default function Articles() {
  const [allCategories, setAllCategories] = useState([]);
  const [category, setCategory] = useState("Highlight");
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
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

        // First, ensure categories exist
        let categoriesData = [];
        const categoriesCheckResponse = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });

        if (categoriesCheckResponse.error) {
          console.warn('Categories error:', categoriesCheckResponse.error);
        } else {
          categoriesData = categoriesCheckResponse.data || [];
        }

        // If no categories exist, create defaults
        if (categoriesData.length === 0) {
          console.log('No categories found, creating defaults...');
          const defaultCategories = [
            { name: 'Technology' },
            { name: 'Business' },
            { name: 'Lifestyle' },
            { name: 'Travel' }
          ];
          const createResponse = await supabase
            .from('categories')
            .insert(defaultCategories)
            .select('name');

          if (!createResponse.error) {
            categoriesData = createResponse.data || [];
            console.log('Default categories created:', categoriesData);
          }
        }

        // Fetch articles - try Published first, then fallback to all
        let articlesResponse = await supabase
          .from('articles')
          .select('*', { count: 'exact' })
          .eq('status', 'Published')
          .order('date', { ascending: false })
          .limit(ITEMS_PER_PAGE);

        // If no published articles, publish drafts and fetch again
        if (!articlesResponse.error && (!articlesResponse.data || articlesResponse.data.length === 0)) {
          console.log('No published articles found, publishing drafts...');
          const publishResponse = await supabase
            .from('articles')
            .update({ status: 'Published' })
            .eq('status', 'Draft')
            .select('id');

          if (!publishResponse.error && (publishResponse.data?.length > 0)) {
            console.log(`Published ${publishResponse.data.length} draft articles`);
            // Fetch articles again
            articlesResponse = await supabase
              .from('articles')
              .select('*', { count: 'exact' })
              .eq('status', 'Published')
              .order('date', { ascending: false })
              .limit(ITEMS_PER_PAGE);
          }
        }

        console.log('Final Categories:', categoriesData);
        console.log('Final Articles Response:', articlesResponse);

        if (articlesResponse.error) throw articlesResponse.error;

        const categoryNames = categoriesData?.map(cat => cat.name) || [];
        const finalCategories = ["Highlight", ...categoryNames];
        setAllCategories(finalCategories);

        // Fetch author info for each article
        const articlesWithAuthors = await Promise.all(
          (articlesResponse.data || []).map(async (article) => {
            if (article.user_id) {
              const { data: authorData } = await supabase
                .from('users')
                .select('name, avatar_url')
                .eq('id', article.user_id)
                .maybeSingle();
              
              return {
                ...article,
                author: authorData || { name: 'Anonymous', avatar_url: null }
              };
            }
            return {
              ...article,
              author: { name: 'Anonymous', avatar_url: null }
            };
          })
        );

        setAllPosts(articlesWithAuthors || []);
        setHasMore((articlesWithAuthors || []).length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAllPosts([]);
        setAllCategories(["Highlight"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (value) => {
    if (value !== category) {
      setCategory(value);
      setCurrentPage(1); // Reset pagination when changing category
    }
  };

  // Filter posts based on category and search query
  useEffect(() => {
    let filtered = allPosts;

    // Filter by category
    if (category !== "Highlight") {
      filtered = filtered.filter(post => post.category === category);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query)
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [category, searchQuery, allPosts]);

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
        // Fetch author info for each new article
        const dataWithAuthors = await Promise.all(
          data.map(async (article) => {
            if (article.user_id) {
              const { data: authorData } = await supabase
                .from('users')
                .select('name, avatar_url')
                .eq('id', article.user_id)
                .maybeSingle();
              
              return {
                ...article,
                author: authorData || { name: 'Anonymous', avatar_url: null }
              };
            }
            return {
              ...article,
              author: { name: 'Anonymous', avatar_url: null }
            };
          })
        );

        setAllPosts(prev => [...prev, ...dataWithAuthors]);
        setHasMore(dataWithAuthors.length === ITEMS_PER_PAGE);
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
                id="search-articles-desktop"
                name="search-articles"
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
              id="search-articles-mobile"
              name="search-articles"
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
        {filteredPosts.length > 0 ? (
          <article className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {filteredPosts.map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                image={blog.thumbnail}
                category={blog.category}
                title={blog.title}
                description={blog.description}
                author={blog.author?.name || blog.author_name || 'Anonymous'}
                authorAvatar={blog.author?.avatar_url}
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