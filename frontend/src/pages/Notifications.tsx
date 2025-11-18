import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";
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
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isConnected,
  } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const handleDeleteNotification = (id: string) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteNotification(id);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div
            className={`flex items-center space-x-2 text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-600" : "bg-red-600"}`}
            />
            <span>{isConnected ? "Live" : "Offline"}</span>
          </div>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
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
                          className="text-primary hover:text-primary/80 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
                        >
                          View Dream
                        </Link>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded px-2 py-1"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteNotification(notification._id)
                        }
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                        aria-label="Delete notification"
                      >
                        Delete
                      </button>
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
