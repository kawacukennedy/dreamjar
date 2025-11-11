import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import ProgressBar from "../components/ProgressBar";
import Skeleton from "../components/Skeleton";
import LoadingSpinner from "../components/LoadingSpinner";
import ShareButton from "../components/ShareButton";
import Tooltip from "../components/Tooltip";
import { useDebounce } from "../hooks/useDebounce";

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
}

function Home() {
  const [wishJars, setWishJars] = useState<WishJar[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const debouncedSearch = useDebounce(search, 300);
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

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    // Mock load more
    setTimeout(() => {
      setWishJars((prev) => [
        ...prev,
        {
          _id: `${prev.length + 1}`,
          title: `Dream ${prev.length + 1}`,
          description: `Description for dream ${prev.length + 1}`,
          stakeAmount: 1000000000,
          pledgedAmount: Math.random() * 1000000000,
          deadline: "2024-12-31",
          status: "Active",
          category: ["Health & Fitness", "Arts & Music", "Education", "Travel"][
            Math.floor(Math.random() * 4)
          ],
          ownerId: {
            displayName: `User ${prev.length + 1}`,
            walletAddress: "0x...",
          },
        },
      ]);
      setLoadingMore(false);
      if (wishJars.length > 20) setHasMore(false);
    }, 1000);
  };

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
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
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (inView && hasMore) {
      loadMore();
    }
  }, [inView, hasMore]);

  const filteredJars = wishJars.filter((jar) => {
    const matchesSearch =
      jar.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      jar.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesFilter =
      filter === "all" || filter === "favorites"
        ? favorites.includes(jar._id)
        : filter === "active" ||
            filter === "resolvedsuccess" ||
            filter === "resolvedfail"
          ? jar.status.toLowerCase() === filter
          : jar.category === filter;
    return matchesSearch && matchesFilter;
  });

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">DreamJar</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Turn your dreams into smart contracts on TON. Stake, share, and
          achieve together!
        </p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Discover Dreams</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search dreams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Search dreams"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              📊
            </span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              aria-label="Filter dreams"
            >
              <option value="all">All</option>
              <option value="favorites">Favorites</option>
              <option value="active">Active</option>
              <option value="resolvedsuccess">Successful</option>
              <option value="resolvedfail">Failed</option>
              <option value="Health & Fitness">Health & Fitness</option>
              <option value="Arts & Music">Arts & Music</option>
              <option value="Education">Education</option>
              <option value="Travel">Travel</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJars.map((jar) => {
          const progress = (jar.pledgedAmount / jar.stakeAmount) * 100;
          return (
            <div
              key={jar._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 animate-fade-in"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{jar.title}</h3>
                  {jar.category && (
                    <span className="text-sm text-primary font-medium">
                      {jar.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Tooltip
                    content={
                      favorites.includes(jar._id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <button
                      onClick={() => toggleFavorite(jar._id)}
                      className="text-2xl hover:scale-110 transition"
                      aria-label="Toggle favorite"
                    >
                      {favorites.includes(jar._id) ? "❤️" : "🤍"}
                    </button>
                  </Tooltip>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      jar.status === "Active"
                        ? "bg-accent text-white"
                        : jar.status === "ResolvedSuccess"
                          ? "bg-success text-white"
                          : "bg-danger text-white"
                    }`}
                  >
                    {jar.status}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {jar.description}
              </p>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Pledged: {jar.pledgedAmount / 1000000000} TON</span>
                  <span>Goal: {jar.stakeAmount / 1000000000} TON</span>
                </div>
                <ProgressBar progress={progress} />
              </div>
              <p className="text-sm text-gray-500 mb-2">
                By:{" "}
                {jar.ownerId.displayName ||
                  jar.ownerId.walletAddress.slice(0, 6) + "..."}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Deadline: {new Date(jar.deadline).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <ShareButton
                  url={`${window.location.origin}/wish/${jar._id}`}
                  title={jar.title}
                  className="flex-1"
                />
                <Link
                  to={`/wish/${jar._id}`}
                  className="flex-1 text-center bg-primary text-white py-2 rounded hover:bg-blue-600 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
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

      <Link
        to="/create"
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition"
        aria-label="Create new dream"
      >
        <span className="text-2xl">+</span>
      </Link>
    </div>
  );
}

export default Home;
