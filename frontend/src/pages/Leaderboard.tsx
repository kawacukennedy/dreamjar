import { useState, useEffect, useMemo } from "react";
import DataTable from "../components/DataTable";
import BarChart from "../components/BarChart";
import Badge from "../components/Badge";

interface LeaderboardEntry {
  rank: number;
  user: {
    displayName?: string;
    walletAddress: string;
    avatarUrl?: string;
  };
  totalPledged: number;
  dreamsCreated: number;
  successRate: number;
}

type SortField = "totalPledged" | "dreamsCreated" | "successRate";
type SortOrder = "asc" | "desc";
type TimeFilter = "all" | "month" | "week" | "day";

function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("totalPledged");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [minPledges, setMinPledges] = useState<number>(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/wish/leaderboard?period=${timeFilter}`,
        );
        if (response.ok) {
          const data = await response.json();
          setLeaders(data);
        } else {
          // Fallback to mock data
          setLeaders([
            {
              rank: 1,
              user: {
                displayName: "Alice",
                walletAddress: "0x1234567890abcdef",
                avatarUrl: "/avatar1.png",
              },
              totalPledged: 5000000000,
              dreamsCreated: 5,
              successRate: 80,
            },
            {
              rank: 2,
              user: { displayName: "Bob", walletAddress: "0xabcdef1234567890" },
              totalPledged: 3000000000,
              dreamsCreated: 3,
              successRate: 100,
            },
            {
              rank: 3,
              user: {
                displayName: "Charlie",
                walletAddress: "0x9876543210fedcba",
              },
              totalPledged: 2000000000,
              dreamsCreated: 2,
              successRate: 50,
            },
            {
              rank: 4,
              user: {
                displayName: "Diana",
                walletAddress: "0xfedcba0987654321",
              },
              totalPledged: 1500000000,
              dreamsCreated: 4,
              successRate: 75,
            },
            {
              rank: 5,
              user: { displayName: "Eve", walletAddress: "0x1111111111111111" },
              totalPledged: 1000000000,
              dreamsCreated: 1,
              successRate: 100,
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        // Fallback to mock data
        setLeaders([
          {
            rank: 1,
            user: {
              displayName: "Alice",
              walletAddress: "0x1234567890abcdef",
              avatarUrl: "/avatar1.png",
            },
            totalPledged: 5000000000,
            dreamsCreated: 5,
            successRate: 80,
          },
          {
            rank: 2,
            user: { displayName: "Bob", walletAddress: "0xabcdef1234567890" },
            totalPledged: 3000000000,
            dreamsCreated: 3,
            successRate: 100,
          },
          {
            rank: 3,
            user: {
              displayName: "Charlie",
              walletAddress: "0x9876543210fedcba",
            },
            totalPledged: 2000000000,
            dreamsCreated: 2,
            successRate: 50,
          },
          {
            rank: 4,
            user: { displayName: "Diana", walletAddress: "0xfedcba0987654321" },
            totalPledged: 1500000000,
            dreamsCreated: 4,
            successRate: 75,
          },
          {
            rank: 5,
            user: { displayName: "Eve", walletAddress: "0x1111111111111111" },
            totalPledged: 1000000000,
            dreamsCreated: 1,
            successRate: 100,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFilter]);

  // Filtered and sorted data
  const filteredAndSortedLeaders = useMemo(() => {
    let filtered = leaders.filter(
      (leader) => leader.totalPledged >= minPledges * 1000000000,
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Re-assign ranks after sorting
    return filtered.map((leader, index) => ({
      ...leader,
      rank: index + 1,
    }));
  }, [leaders, sortField, sortOrder, minPledges]);

  // Chart data for top 10
  const chartData = useMemo(() => {
    return filteredAndSortedLeaders.slice(0, 10).map((leader) => ({
      label:
        leader.user.displayName ||
        leader.user.walletAddress.slice(0, 6) + "...",
      value: leader.totalPledged / 1000000000,
      color: leader.rank <= 3 ? "bg-yellow-500" : "bg-primary",
    }));
  }, [filteredAndSortedLeaders]);

  const tableColumns = [
    {
      key: "rank",
      header: "Rank",
      render: (value: number) => (
        <div className="flex items-center justify-center w-8">
          <span className="font-bold text-lg">
            {value <= 3
              ? value === 1
                ? "🥇"
                : value === 2
                  ? "🥈"
                  : "🥉"
              : value}
          </span>
        </div>
      ),
      className: "w-16",
    },
    {
      key: "user",
      header: "Dreamer",
      render: (_: any, row: LeaderboardEntry) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.user.avatarUrl || "/default-avatar.png"}
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.user.displayName ||
                row.user.walletAddress.slice(0, 6) + "..."}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.dreamsCreated} dreams
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "totalPledged",
      header: "Total Pledged",
      render: (value: number) => (
        <div className="font-bold text-primary">
          {(value / 1000000000).toFixed(1)} TON
        </div>
      ),
      sortable: true,
    },
    {
      key: "successRate",
      header: "Success Rate",
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">{value}%</div>
          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "badge",
      header: "Status",
      render: (_: any, row: LeaderboardEntry) =>
        row.rank <= 10 && (
          <Badge variant={row.rank <= 3 ? "primary" : "info"} size="sm">
            Top {row.rank <= 3 ? "3" : "10"}
          </Badge>
        ),
    },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">🏆 Dream Leaderboard</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Top dreamers and supporters in the DreamJar community
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Time Period
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
              <option value="day">Today</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="totalPledged">Total Pledged</option>
              <option value="dreamsCreated">Dreams Created</option>
              <option value="successRate">Success Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="desc">Highest First</option>
              <option value="asc">Lowest First</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Min Pledges (TON)
            </label>
            <input
              type="number"
              value={minPledges}
              onChange={(e) => setMinPledges(Number(e.target.value))}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {filteredAndSortedLeaders.slice(0, 3).map((entry, index) => {
          const positions = [
            { height: "h-32", color: "bg-yellow-400", medal: "🥇" },
            { height: "h-24", color: "bg-gray-300", medal: "🥈" },
            { height: "h-20", color: "bg-amber-600", medal: "🥉" },
          ];
          const pos = positions[index];

          return (
            <div
              key={entry.rank}
              className={`${pos.height} ${pos.color} rounded-lg p-4 flex flex-col items-center justify-end text-white shadow-lg transform hover:scale-105 transition-all duration-200`}
            >
              <div className="text-4xl mb-2">{pos.medal}</div>
              <img
                src={entry.user.avatarUrl || "/default-avatar.png"}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-4 border-white mb-2"
              />
              <div className="font-bold text-center">
                {entry.user.displayName ||
                  entry.user.walletAddress.slice(0, 6) + "..."}
              </div>
              <div className="text-sm opacity-90">
                {(entry.totalPledged / 1000000000).toFixed(1)} TON
              </div>
              <div className="text-xs opacity-75">
                {entry.dreamsCreated} dreams • {entry.successRate}% success
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">
          📊 Top 10 Pledges Overview
        </h3>
        <BarChart
          data={chartData}
          height={200}
          showValues={true}
          className="mb-4"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Total pledges in TON for the top 10 dreamers
        </p>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-4 bg-gradient-to-r from-primary to-accent text-white">
          <h3 className="font-bold text-lg">Full Rankings</h3>
          <p className="text-sm opacity-90">
            Complete leaderboard standings ({filteredAndSortedLeaders.length}{" "}
            dreamers)
          </p>
        </div>

        <DataTable
          data={filteredAndSortedLeaders}
          columns={tableColumns}
          loading={loading}
          emptyMessage="No dreamers match the current filters"
          className="max-h-96 overflow-y-auto"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-primary">
            {filteredAndSortedLeaders.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Active Dreamers
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-green-500">
            {(
              filteredAndSortedLeaders.reduce(
                (sum, l) => sum + l.totalPledged,
                0,
              ) / 1000000000
            ).toFixed(0)}{" "}
            TON
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Pledged
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-blue-500">
            {filteredAndSortedLeaders.length > 0
              ? Math.round(
                  filteredAndSortedLeaders.reduce(
                    (sum, l) => sum + l.successRate,
                    0,
                  ) / filteredAndSortedLeaders.length,
                )
              : 0}
            %
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg Success Rate
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <div className="text-3xl mb-2">🌟</div>
          <div className="text-2xl font-bold text-purple-500">
            {filteredAndSortedLeaders.reduce(
              (sum, l) => sum + l.dreamsCreated,
              0,
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Dreams
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
