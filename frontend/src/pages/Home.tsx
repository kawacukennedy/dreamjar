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
  const {
    filters,
    updateFilters,
    setIsLoading,
    savedSearches,
    saveCurrentSearch,
    loadSavedSearch,
    deleteSavedSearch,
  } = useSearch();
  const { trackPageView, trackSearch, trackWishView } = useAnalytics();
  const [wishJars, setWishJars] = useState<WishJar[]>([]);
  const {
    value: cachedWishes,
    setValue: setCachedWishes,
    isOnline,
  } = useOfflineStorage<WishJar[]>({
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

  const fetchWishJars = useCallback(
    async (cursor?: string) => {
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
    },
    [filters, setIsLoading],
  );

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
    <div className="min-h-screen">
      {/* Hero Section with Filter */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-h1 font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Turn Dreams Into Reality
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Join a community where goals become smart contracts. Stake TON,
              get support, and achieve the impossible together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/create"
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🚀 Create Your Dream
              </Link>
              <Link
                to="/trending"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-8 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-300 dark:border-gray-600"
              >
                🏆 View Leaderboard
              </Link>
            </div>
          </div>

          {/* Hero Filter */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-level2 max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <SearchBar className="w-full" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                  aria-label="Sort dreams"
                >
                  <option value="newest">Newest</option>
                  <option value="trending">Trending</option>
                  <option value="pledged-high">Most Pledged</option>
                  <option value="deadline">Ending Soon</option>
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
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                <h3 className="font-medium mb-3">Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        updateFilters({ category: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      <option value="Health & Fitness">
                        🏃 Health & Fitness
                      </option>
                      <option value="Arts & Music">🎨 Arts & Music</option>
                      <option value="Education">📚 Education</option>
                      <option value="Travel">✈️ Travel</option>
                      <option value="Career">💼 Career</option>
                      <option value="Personal">🌟 Personal</option>
                      <option value="Other">📌 Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        updateFilters({ status: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="active">🔥 Active</option>
                      <option value="verified">✅ Successful</option>
                      <option value="failed">❌ Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) =>
                        updateFilters({ dateRange: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="all">All Time</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Stake Range: {filters.stakeRange[0]} -{" "}
                      {filters.stakeRange[1]} TON
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={filters.stakeRange[0]}
                        onChange={(e) =>
                          updateFilters({
                            stakeRange: [
                              parseInt(e.target.value) || 0,
                              filters.stakeRange[1],
                            ],
                          })
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={filters.stakeRange[1]}
                        onChange={(e) =>
                          updateFilters({
                            stakeRange: [
                              filters.stakeRange[0],
                              parseInt(e.target.value) || 1000,
                            ],
                          })
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feed Grid and Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Main Feed Grid */}
          <div className="flex-1">
            <div
              className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]"
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
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-xl font-medium mb-2">No dreams found</h3>
                  <p>Try adjusting your filters or create your first dream!</p>
                </div>
                <Link
                  to="/create"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Your Dream
                </Link>
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {hasMore && <div ref={ref} className="h-10" />}
          </div>

          {/* Sidebar - Hot Wishes */}
          <aside className="hidden lg:block w-80">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-level1 sticky top-4">
              <h3 className="text-h4 font-bold mb-4">🔥 Hot Wishes</h3>
              <Suspense fallback={<LoadingSpinner />}>
                <ActivityFeed limit={5} showHeader={false} />
              </Suspense>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link
        to="/create"
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-level3 hover:bg-blue-600 active:bg-blue-700 transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-10"
        aria-label="Create new dream"
      >
        <span className="text-2xl font-bold">+</span>
      </Link>
    </div>
  );
}

export default Home;
