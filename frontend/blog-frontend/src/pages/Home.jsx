import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getPosts } from '../store/slices/postsSlice';
import PostCard from '../components/blog/PostCard';
import PostSkeleton from '../components/blog/PostSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Sparkles, TrendingUp, Users, BookOpen } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const { posts, pagination, isLoading, isError, message } = useSelector((state) => state.posts);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      sort: sortBy,
      search: searchQuery,
    };

    dispatch(getPosts(params));

    // Update URL params
    const newSearchParams = new URLSearchParams();
    if (searchQuery) newSearchParams.set('search', searchQuery);
    if (sortBy !== '-createdAt') newSearchParams.set('sort', sortBy);
    if (currentPage > 1) newSearchParams.set('page', currentPage.toString());
    
    setSearchParams(newSearchParams);
  }, [dispatch, currentPage, sortBy, searchQuery, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // searchQuery state will trigger useEffect
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Posts</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button onClick={() => dispatch(getPosts({ page: 1, limit: 10, sort: '-createdAt' }))}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20"></div>
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative text-center py-20 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Animated title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-1000">
                Welcome to <span className="relative">
                  BlogApp
                  <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom-4 duration-1000 delay-200">
                Discover amazing stories, share your thoughts, and connect with writers from around the world.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-1000 delay-400">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">{posts.length}+ Posts</span>
                </div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold">Growing Community</span>
                </div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <span className="font-semibold">Trending Topics</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-4 duration-1000 delay-600">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" asChild>
                <a href="#posts">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Posts
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105" asChild>
                <a href="/register">
                  <Users className="mr-2 h-5 w-5" />
                  Join Community
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section id="posts" className="space-y-8">
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                Latest Posts
              </h2>
              <p className="text-muted-foreground">Discover fresh content from our community</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 focus:border-blue-500/50 transition-all duration-300"
                />
              </form>

              {/* Sort */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-48 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-createdAt">Newest First</SelectItem>
                  <SelectItem value="createdAt">Oldest First</SelectItem>
                  <SelectItem value="-likesCount">Most Liked</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="-title">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                <PostSkeleton />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <div 
                  key={post._id} 
                  className="animate-in slide-in-from-bottom-4 duration-500 hover:scale-[1.02] transition-transform"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12 p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/20">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={currentPage === pageNum 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                          : "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold">No posts found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No posts match your search for "${searchQuery}"`
                  : "Be the first to share your story!"
                }
              </p>
              {searchQuery && (
                <Button 
                  onClick={() => setSearchQuery('')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

