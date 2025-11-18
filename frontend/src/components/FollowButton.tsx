import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { useOfflineQueue } from "../hooks/useOfflineStorage";
import { api } from "../services/api";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function FollowButton({
  targetUserId,
  size = "md",
  className = "",
}: FollowButtonProps) {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const { trackFollow, trackUnfollow } = useAnalytics();
  const { addToQueue } = useOfflineQueue();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Don't show follow button for self
  if (user?.id === targetUserId) {
    return null;
  }

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!token || !targetUserId) return;

      try {
        const data = await api.follow.getStatus(targetUserId, token);
        setIsFollowing(data.isFollowing);
      } catch (error) {
        console.error("Failed to check follow status:", error);
      }
    };

    checkFollowStatus();
  }, [targetUserId, token]);

  const handleFollowToggle = async () => {
    if (!token || loading) return;

    setLoading(true);
    const action = isFollowing ? "unfollow" : "follow";
    const actionData = { type: action, targetUserId, timestamp: Date.now() };

    try {
      if (isFollowing) {
        await api.follow.unfollow(targetUserId, token);
        setIsFollowing(false);
        trackUnfollow(targetUserId);
        addToast("Unfollowed successfully", "success");
      } else {
        await api.follow.follow(targetUserId, token);
        setIsFollowing(true);
        trackFollow(targetUserId);
        addToast("Following successfully", "success");
      }
    } catch (error) {
      // If offline or network error, queue the action
      if (!navigator.onLine || error.message?.includes("network")) {
        addToQueue(JSON.stringify(actionData));
        // Optimistically update UI
        setIsFollowing(!isFollowing);
        addToast(`Action queued for when you're back online`, "info");
      } else {
        console.error("Follow toggle error:", error);
        addToast("Failed to update follow status", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 focus:ring-2 focus:outline-none focus:ring-offset-2 min-h-[44px] ${
        isFollowing
          ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400"
          : "bg-primary text-white hover:bg-blue-600 focus:ring-primary"
      } ${sizeClasses[size]} ${className}`}
      aria-label={isFollowing ? "Unfollow this user" : "Follow this user"}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export default FollowButton;
