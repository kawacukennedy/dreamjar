import { useState, useEffect } from "react";

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

function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/wish/leaderboard`,
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
                walletAddress: "0x...",
                avatarUrl: "/avatar1.png",
              },
              totalPledged: 5000000000,
              dreamsCreated: 5,
              successRate: 80,
            },
            {
              rank: 2,
              user: { displayName: "Bob", walletAddress: "0x..." },
              totalPledged: 3000000000,
              dreamsCreated: 3,
              successRate: 100,
            },
            {
              rank: 3,
              user: { walletAddress: "0x..." },
              totalPledged: 2000000000,
              dreamsCreated: 2,
              successRate: 50,
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
              walletAddress: "0x...",
              avatarUrl: "/avatar1.png",
            },
            totalPledged: 5000000000,
            dreamsCreated: 5,
            successRate: 80,
          },
          {
            rank: 2,
            user: { displayName: "Bob", walletAddress: "0x..." },
            totalPledged: 3000000000,
            dreamsCreated: 3,
            successRate: 100,
          },
          {
            rank: 3,
            user: { walletAddress: "0x..." },
            totalPledged: 2000000000,
            dreamsCreated: 2,
            successRate: 50,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">🏆 Dream Leaderboard</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Top dreamers and supporters in the DreamJar community
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {leaders.slice(0, 3).map((entry, index) => {
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

      {/* Full Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-primary to-accent text-white">
          <h3 className="font-bold text-lg">Full Rankings</h3>
          <p className="text-sm opacity-90">Complete leaderboard standings</p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {leaders.map((entry) => (
            <div
              key={entry.rank}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="font-bold text-lg">
                    {entry.rank <= 3
                      ? entry.rank === 1
                        ? "🥇"
                        : entry.rank === 2
                          ? "🥈"
                          : "🥉"
                      : entry.rank}
                  </span>
                </div>

                <img
                  src={entry.user.avatarUrl || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {entry.user.displayName ||
                      entry.user.walletAddress.slice(0, 6) + "..."}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.dreamsCreated} dreams created
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-primary">
                    {(entry.totalPledged / 1000000000).toFixed(1)} TON
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.successRate}% success rate
                  </div>
                </div>

                {entry.rank <= 10 && (
                  <Badge variant="primary" size="sm">
                    Top {entry.rank <= 3 ? "3" : "10"}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-primary">
            {leaders.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Active Dreamers
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-green-500">
            {(
              leaders.reduce((sum, l) => sum + l.totalPledged, 0) / 1000000000
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
            {Math.round(
              leaders.reduce((sum, l) => sum + l.successRate, 0) /
                leaders.length,
            )}
            %
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg Success Rate
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
