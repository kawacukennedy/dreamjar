import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";

interface WishJar {
  _id: string;
  title: string;
  description: string;
  stakeAmount: number;
  pledgedAmount: number;
  deadline: string;
  status: string;
  ownerId: { displayName?: string; walletAddress: string };
}

function Home() {
  const [wishJars, setWishJars] = useState<WishJar[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

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
          ownerId: { walletAddress: "0x..." },
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredJars = wishJars.filter((jar) => {
    const matchesSearch =
      jar.title.toLowerCase().includes(search.toLowerCase()) ||
      jar.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || jar.status.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading dreams...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Discover Dreams</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search dreams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="resolvedsuccess">Successful</option>
            <option value="resolvedfail">Failed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJars.map((jar) => {
          const progress = (jar.pledgedAmount / jar.stakeAmount) * 100;
          return (
            <div
              key={jar._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{jar.title}</h3>
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
              <Link
                to={`/wish/${jar._id}`}
                className="block text-center bg-primary text-white py-2 rounded hover:bg-blue-600 transition"
              >
                View Details
              </Link>
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

      <Link
        to="/create"
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        <span className="text-2xl">+</span>
      </Link>
    </div>
  );
}

export default Home;
