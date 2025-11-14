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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6">Dream Leaderboard</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 dark:bg-gray-700 font-semibold">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Dreamer</div>
          <div className="col-span-2">Total Pledged</div>
          <div className="col-span-2">Dreams Created</div>
          <div className="col-span-2">Success Rate</div>
          <div className="col-span-1">Badge</div>
        </div>
        {leaders.map((entry) => (
          <div
            key={entry.rank}
            className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-600"
          >
            <div className="col-span-1 font-bold text-lg">
              {entry.rank === 1
                ? "🥇"
                : entry.rank === 2
                  ? "🥈"
                  : entry.rank === 3
                    ? "🥉"
                    : entry.rank}
            </div>
            <div className="col-span-4 flex items-center">
              <img
                src={entry.user.avatarUrl || "/default-avatar.png"}
                alt="Avatar"
                className="w-8 h-8 rounded-full mr-3"
              />
              <span>
                {entry.user.displayName ||
                  entry.user.walletAddress.slice(0, 6) + "..."}
              </span>
            </div>
            <div className="col-span-2">
              {entry.totalPledged / 1000000000} TON
            </div>
            <div className="col-span-2">{entry.dreamsCreated}</div>
            <div className="col-span-2">{entry.successRate}%</div>
            <div className="col-span-1">
              {entry.rank <= 3 && <span className="text-2xl">🏆</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
