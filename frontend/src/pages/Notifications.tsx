import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Badge from "../components/Badge";

interface Notification {
  _id: string;
  type: "pledge" | "vote" | "resolution" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedWishId?: string;
  amount?: number;
}

function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      try {
        // Mock data for now - in real app, fetch from API
        const mockNotifications: Notification[] = [
          {
            _id: "1",
            type: "pledge",
            title: "New Pledge!",
            message: "Someone pledged 50 TON to your dream 'Run Marathon'",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            relatedWishId: "1",
            amount: 50,
          },
          {
            _id: "2",
            type: "vote",
            title: "Proof Voted",
            message: "Your proof for 'Learn Guitar' received 5 yes votes",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            relatedWishId: "2",
          },
          {
            _id: "3",
            type: "resolution",
            title: "Dream Resolved!",
            message:
              "Your dream 'Run Marathon' has been successfully completed!",
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            relatedWishId: "1",
          },
          {
            _id: "4",
            type: "system",
            title: "Welcome to DreamJar!",
            message:
              "Thanks for joining our community. Start by creating your first dream!",
            read: true,
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 7,
            ).toISOString(),
          },
        ];

        setNotifications(mockNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === id ? { ...notif, read: true } : notif,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "pledge":
        return "💰";
      case "vote":
        return "🗳️";
      case "resolution":
        return "🎯";
      case "system":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "pledge":
        return "success";
      case "vote":
        return "info";
      case "resolution":
        return "primary";
      case "system":
        return "warning";
      default:
        return "info";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-primary hover:text-primary/80 transition-colors duration-200"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          {["all", "unread", "read"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === filterType
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              {filterType === "unread" &&
                notifications.filter((n) => !n.read).length > 0 && (
                  <Badge variant="danger" size="sm" className="ml-2">
                    {notifications.filter((n) => !n.read).length}
                  </Badge>
                )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-lg">No notifications yet</p>
            <p className="text-sm">
              When you receive pledges, votes, or updates, they'll appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 transition-all duration-200 hover:shadow-md ${
                !notification.read
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </h3>
                    <Badge
                      variant={getNotificationColor(notification.type)}
                      size="sm"
                    >
                      {notification.type}
                    </Badge>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <div className="flex space-x-2">
                      {notification.relatedWishId && (
                        <Link
                          to={`/wish/${notification.relatedWishId}`}
                          className="text-primary hover:text-primary/80 transition-colors duration-200 text-sm"
                        >
                          View Dream
                        </Link>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 text-sm"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
