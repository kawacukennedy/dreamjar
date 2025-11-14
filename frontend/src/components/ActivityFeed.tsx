import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Activity {
  id: string;
  type: "pledge" | "proof" | "vote" | "completion" | "follow";
  user: {
    displayName?: string;
    walletAddress: string;
    avatarUrl?: string;
  };
  wishTitle: string;
  amount?: number;
  timestamp: Date;
  wishId: string;
}

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  limit = 10,
  showHeader = true,
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockActivities: Activity[] = [
      {
        id: "1",
        type: "pledge",
        user: { displayName: "Alice Johnson", walletAddress: "0x123..." },
        wishTitle: "Run Marathon",
        amount: 25,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        wishId: "1",
      },
      {
        id: "2",
        type: "proof",
        user: { displayName: "Bob Smith", walletAddress: "0x456..." },
        wishTitle: "Learn Guitar",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        wishId: "2",
      },
      {
        id: "3",
        type: "vote",
        user: { walletAddress: "0x789..." },
        wishTitle: "Write Novel",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        wishId: "3",
      },
      {
        id: "4",
        type: "completion",
        user: { displayName: "Carol Davis", walletAddress: "0xabc..." },
        wishTitle: "Plant Garden",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        wishId: "4",
      },
    ];

    setActivities(mockActivities);
    setLoading(false);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pledge":
        return "💰";
      case "proof":
        return "📸";
      case "vote":
        return "🗳️";
      case "completion":
        return "🎉";
      case "follow":
        return "👥";
      default:
        return "📢";
    }
  };

  const getActivityText = (activity: Activity) => {
    const userName =
      activity.user.displayName ||
      activity.user.walletAddress.slice(0, 6) + "...";

    switch (activity.type) {
      case "pledge":
        return `${userName} pledged ${activity.amount} TON to "${activity.wishTitle}"`;
      case "proof":
        return `${userName} posted proof for "${activity.wishTitle}"`;
      case "vote":
        return `${userName} voted on proof for "${activity.wishTitle}"`;
      case "completion":
        return `🎉 "${activity.wishTitle}" was completed successfully!`;
      case "follow":
        return `${userName} started following your dreams`;
      default:
        return `${userName} performed an action on "${activity.wishTitle}"`;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Live updates
          </span>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, limit).map((activity) => (
            <div
              key={activity.id}
              className="flex space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg">
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                  {getActivityText(activity)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>

              {activity.type === "pledge" && activity.amount && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    +{activity.amount} TON
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activities.length > limit && (
        <button className="w-full text-center text-primary hover:text-primary/80 transition-colors duration-200 text-sm py-2">
          View all activity
        </button>
      )}
    </div>
  );
};

export default ActivityFeed;
