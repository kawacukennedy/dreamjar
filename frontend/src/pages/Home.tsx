import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { lazy, Suspense } from "react";
import Skeleton from "../components/Skeleton";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";
import WishCard from "../components/WishCard";
import { useSearch } from "../contexts/SearchContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { useOfflineStorage } from "../hooks/useOfflineStorage";
import { api } from "../services/api";

const ActivityFeed = lazy(() => import("../components/ActivityFeed"));

interface WishJar {
  _id: string;
  title: string;
  description: string;
  stakeAmount: number;
  pledgedAmount: number;
  deadline: string;
  status: string;
  category?: string;
  ownerId: { displayName?: string; walletAddress: string };
  createdAt?: string;
}

function Home() {
  const { filters, updateFilters, setIsLoading, savedSearches, saveCurrentSearch, loadSavedSearch, deleteSavedSearch } = useSearch();
  const { trackPageView, trackSearch, trackWishView } = useAnalytics();
  const [wishJars, setWishJars] = useState<WishJar[]>([]);
  const { value: cachedWishes, setValue: setCachedWishes, isOnline } = useOfflineStorage<WishJar[]>({
    key: "cachedWishes",
    defaultValue: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [stakeRange, setStakeRange] = useState<[number, number]>([0, 1000]);

  const { ref, inView } = useInView();

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const handleSaveCurrentSearch = () => {
    const searchName = prompt("Enter a name for this search:");
    if (!searchName) return;
    saveCurrentSearch(searchName);
  };

  const handleLoadSavedSearch = (savedSearch: any) => {
    loadSavedSearch(savedSearch.id);
    setShowSavedSearches(false);
  };

  const handleDeleteSavedSearch = (id: string) => {
    deleteSavedSearch(id);
  };

  const fetchWishJars = useCallback(async (cursor?: string) => {
    try {
      setIsLoading(true);
      const params: any = {
        search: filters.query,
        status: filters.status,
        category: filters.category,
        sortBy: filters.sortBy,
        dateRange: filters.dateRange,
        limit: 20,
      };

      if (filters.stakeRange[0] > 0) {
        params.minStake = filters.stakeRange[0] * 1000000000; // Convert TON to nanoTON
      }
      if (filters.stakeRange[1] < 1000) {
        params.maxStake = filters.stakeRange[1] * 1000000000; // Convert TON to nanoTON
      }

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await api.wish.list(params);

      if (cursor) {
        // Loading more
        if (response.wishes.length === 0) {
          setHasMore(false);
        } else {
          setWishJars((prev) => [...prev, ...response.wishes]);
          setNextCursor(response.pagination.nextCursor);
          setHasMore(response.pagination.hasNextPage);
        }
      } else {
        // Initial load
        setWishJars(response.wishes);
        setNextCursor(response.pagination.nextCursor);
        setHasMore(response.pagination.hasNextPage);
        // Cache the wishes for offline use
        setCachedWishes(response.wishes);
      }
    } catch (error) {
      console.error("Failed to fetch wish jars:", error);
      // Fallback to mock data
      setWishJars([
        {
          _id: "1",
          title: "Run Marathon",
          description: "Complete a full marathon in under 4 hours",
          stakeAmount: 1000000000,
          pledgedAmount: 500000000,
          deadline: "2024-12-31",
          status: "Active",
          category: "Health & Fitness",
          ownerId: { displayName: "Alice", walletAddress: "0x..." },
        },
        {
          _id: "2",
          title: "Learn Guitar",
          description: "Master 10 songs on guitar",
          stakeAmount: 500000000,
          pledgedAmount: 200000000,
          deadline: "2024-11-30",
          status: "Active",
          category: "Arts & Music",
          ownerId: { walletAddress: "0x..." },
        },
      ]);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [filters, setIsLoading]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    await fetchWishJars(nextCursor);
    setLoadingMore(false);
  };

  useEffect(() => {
    if (!isOnline && cachedWishes.length > 0) {
      // Load from cache when offline
      setWishJars(cachedWishes);
      setHasMore(false);
    } else {
      fetchWishJars();
    }
    trackPageView("home");
  }, [fetchWishJars, trackPageView, isOnline, cachedWishes]);

  // Track search when filters change
  useEffect(() => {
    if (filters.query) {
      trackSearch(filters.query, filters);
    }
  }, [filters, trackSearch]);

  useEffect(() => {
    if (inView && hasMore) {
      loadMore();
    }
  }, [inView, hasMore]);

  // Filter for favorites locally since API doesn't handle this
  const filteredJars = useMemo(() => {
    return wishJars.filter((jar) => {
      // If filtering by favorites, check if jar is in favorites
      if (filters.category === "favorites") {
        return favorites.includes(jar._id);
      }
      return true;
    });
  }, [wishJars, filters.category, favorites]);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="grid">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-2 w-full mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">DreamJar</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Turn your dreams into smart contracts on TON. Stake, share, and
          achieve together!
        </p>
      </header>
       {/* Hero Section */}
       <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 mb-8">
         <div className="text-center">
           <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
             Turn Dreams Into Reality
           </h1>
           <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
             Join a community where goals become smart contracts. Stake TON, get support,
             and achieve the impossible together.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link
               to="/create"
               className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
             >
               🚀 Create Your Dream
             </Link>
             <Link
               to="/leaderboard"
               className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-8 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-300 dark:border-gray-600"
             >
               🏆 View Leaderboard
             </Link>
           </div>
         </div>
       </div>

       <section className="mb-6" aria-labelledby="discover-dreams">
         <h2 id="discover-dreams" className="text-2xl font-bold mb-4">Discover Dreams</h2>
         <SearchBar className="mb-4" />

         {/* Filters and Controls */}
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
           <div className="flex flex-wrap items-center justify-between gap-4">
             <div className="flex gap-2">
               <select
                 value={filters.sortBy}
                 onChange={(e) => updateFilters({ sortBy: e.target.value })}
                 className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                 aria-label="Sort dreams"
               >
                 <option value="newest">Newest</option>
                 <option value="oldest">Oldest</option>
                 <option value="pledged-high">Most Pledged</option>
                 <option value="pledged-low">Least Pledged</option>
                 <option value="goal-high">Highest Goal</option>
                 <option value="goal-low">Lowest Goal</option>
               </select>
               <button
                 onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                 className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                   showAdvancedFilters
                     ? "bg-primary text-white"
                     : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                 }`}
                 aria-label="Toggle advanced filters"
               >
                 🔧 Filters
               </button>
               <button
                 onClick={() => setShowSavedSearches(!showSavedSearches)}
                 className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 relative"
                 aria-label="Saved searches"
               >
                 💾 Saved
                 {savedSearches.length > 0 && (
                   <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                     {savedSearches.length}
                   </span>
                 )}
               </button>
             </div>
           </div>

           {showAdvancedFilters && (
             <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
               <h3 className="font-medium mb-3">Advanced Filters</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">Quick Filter</label>
                   <select
                     value={filter}
                     onChange={(e) => setFilter(e.target.value)}
                     className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                   >
                     <option value="all">All</option>
                     <option value="favorites">⭐ Favorites</option>
                     <option value="active">🔥 Active</option>
                     <option value="resolvedsuccess">✅ Successful</option>
                     <option value="resolvedfail">❌ Failed</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Category</label>
                   <select
                     value={categoryFilter}
                     onChange={(e) => setCategoryFilter(e.target.value)}
                     className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                   >
                     <option value="all">All Categories</option>
                     <option value="Health & Fitness">🏃 Health & Fitness</option>
                     <option value="Arts & Music">🎨 Arts & Music</option>
                     <option value="Education">📚 Education</option>
                     <option value="Travel">✈️ Travel</option>
                     <option value="Career">💼 Career</option>
                     <option value="Personal">🌟 Personal</option>
                     <option value="Other">📌 Other</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Status</label>
                   <select
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                   >
                     <option value="all">All Status</option>
                     <option value="active">🔥 Active</option>
                     <option value="resolvedsuccess">✅ Successful</option>
                     <option value="resolvedfail">❌ Failed</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Date Range</label>
                   <select
                     value={dateRange}
                     onChange={(e) => setDateRange(e.target.value)}
                     className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                   >
                     <option value="all">All Time</option>
                     <option value="today">📅 Today</option>
                     <option value="week">📊 This Week</option>
                     <option value="month">🗓️ This Month</option>
                   </select>
                 </div>
               </div>

               <div className="mt-4">
                 <label className="block text-sm font-medium mb-2">
                   Stake Amount Range: {stakeRange[0]} - {stakeRange[1]} TON
                 </label>
                 <div className="px-2">
                   <div className="flex items-center space-x-4">
                     <input
                       type="range"
                       min="0"
                       max="1000"
                       step="10"
                       value={stakeRange[0]}
                       onChange={(e) => setStakeRange([parseInt(e.target.value), stakeRange[1]])}
                       className="flex-1"
                     />
                     <span className="text-sm font-medium w-16 text-center">{stakeRange[0]}</span>
                   </div>
                   <div className="flex items-center space-x-4 mt-2">
                     <input
                       type="range"
                       min="0"
                       max="1000"
                       step="10"
                       value={stakeRange[1]}
                       onChange={(e) => setStakeRange([stakeRange[0], parseInt(e.target.value)])}
                       className="flex-1"
                     />
                     <span className="text-sm font-medium w-16 text-center">{stakeRange[1]}</span>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {showSavedSearches && (
             <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
               <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                 <div className="flex justify-between items-center">
                   <h4 className="font-medium">💾 Saved Searches</h4>
                   <button
                     onClick={handleSaveCurrentSearch}
                     className="text-primary hover:text-primary/80 text-sm"
                   >
                     Save Current
                   </button>
                 </div>
               </div>
               {savedSearches.length === 0 ? (
                 <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                   No saved searches yet
                 </div>
               ) : (
                 savedSearches.map((savedSearch) => (
                   <div
                     key={savedSearch.id}
                     className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                   >
                     <div className="flex justify-between items-start">
                       <div className="flex-1">
                         <button
                           onClick={() => handleLoadSavedSearch(savedSearch)}
                           className="text-left w-full"
                         >
                           <div className="font-medium">{savedSearch.name}</div>
                           <div className="text-sm text-gray-500 dark:text-gray-400">
                             {savedSearch.search && `"${savedSearch.search}" • `}
                             {savedSearch.categoryFilter !== "all" && `${savedSearch.categoryFilter} • `}
                             {savedSearch.statusFilter !== "all" && savedSearch.statusFilter}
                           </div>
                         </button>
                       </div>
                       <button
                         onClick={() => handleDeleteSavedSearch(savedSearch.id)}
                         className="text-red-500 hover:text-red-700 p-1"
                         aria-label="Delete saved search"
                       >
                         🗑️
                       </button>
                     </div>
                   </div>
                 ))
               )}
             </div>
           )}
         </div>
       </section>
      </div>

      <div
        className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        role="grid"
        aria-label="Dream jars"
      >
        {filteredJars.map((jar) => (
          <WishCard
            key={jar._id}
            jar={jar}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {filteredJars.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No dreams found.{" "}
          <Link to="/create" className="text-primary">
            Create one!
          </Link>
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}

      {hasMore && <div ref={ref} className="h-10" />}

      {/* Activity Feed Sidebar */}
      <div className="fixed right-4 top-20 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hidden xl:block max-h-96 overflow-y-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <ActivityFeed limit={5} showHeader={true} />
        </Suspense>
      </div>

      <Link
        to="/create"
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-300 transform hover:scale-110 active:scale-95 hover:rotate-12 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-bounce touch-manipulation"
        aria-label="Create new dream"
      >
        <span className="text-2xl font-bold">+</span>
      </Link>
    </div>
  );
}

export default Home;
