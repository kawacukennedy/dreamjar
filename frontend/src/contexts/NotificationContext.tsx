import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface NotificationItem {
  _id: string;
  type: "pledge" | "vote" | "resolution" | "system" | "follow" | "mention";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedWishId?: string;
  relatedUserId?: string;
  amount?: number;
  metadata?: any;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  socket: Socket | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  requestPushPermission: () => Promise<NotificationPermission>;
  sendPushNotification: (title: string, options?: NotificationOptions) => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pushPermission, setPushPermission] =
    useState<NotificationPermission>("default");
  const { token, user } = useAuth();
  const { addToast } = useToast();

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:8080",
      {
        auth: { token },
        transports: ["websocket", "polling"],
        timeout: 20000,
      },
    );

    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from notification server");
      setIsConnected(false);
    });

    // Listen for real-time notifications
    newSocket.on("notification", (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);

      // Show toast for important notifications
      if (notification.type !== "system") {
        addToast(notification.title, "info");
      }

      // Send push notification if permission granted
      if (pushPermission === "granted" && document.hidden) {
        sendPushNotification(notification.title, {
          body: notification.message,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: notification._id,
          data: { notificationId: notification._id },
        });
      }
    });

    // Listen for real-time updates
    newSocket.on("pledge-update", (data) => {
      // Update pledge amounts in real-time
      console.log("Pledge update:", data);
    });

    newSocket.on("vote-update", (data) => {
      // Update vote counts in real-time
      console.log("Vote update:", data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Fetch initial notifications
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/notification`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, [token]);

  // Check push notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!("Notification" in window)) {
        return "denied";
      }

      try {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);
        return permission;
      } catch (error) {
        console.error("Error requesting push permission:", error);
        return "denied";
      }
    }, []);

  const sendPushNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (pushPermission === "granted" && "Notification" in window) {
        const notification = new Notification(title, {
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          ...options,
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        // Handle click
        notification.onclick = () => {
          window.focus();
          if (options?.data?.notificationId) {
            markAsRead(options.data.notificationId);
          }
        };
      }
    },
    [pushPermission],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/notification/${id}/read`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification._id === id
                ? { ...notification, read: true }
                : notification,
            ),
          );
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [token],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notification/mark-all-read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true })),
        );
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [token]);

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/notification/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          setNotifications((prev) =>
            prev.filter((notification) => notification._id !== id),
          );
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    },
    [token],
  );

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    socket,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPushPermission,
    sendPushNotification,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
