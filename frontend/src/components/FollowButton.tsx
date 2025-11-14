import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

interface FollowButtonProps {
  targetWalletAddress: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function FollowButton({
  targetWalletAddress,
  size = "md",
  className = "",
}: FollowButtonProps) {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Don't show follow button for self
  if (user?.walletAddress === targetWalletAddress) {
    return null;
  }

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!token || !targetWalletAddress) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/follow/${targetWalletAddress}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error("Failed to check follow status:", error);
      }
    };

    checkFollowStatus();
  }, [targetWalletAddress, token]);

  const handleFollowToggle = async () => {
    if (!token || loading) return;

    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/follow/${targetWalletAddress}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setIsFollowing(!isFollowing);
        addToast(
          isFollowing ? "Unfollowed successfully" : "Following successfully",
          "success",
        );
      } else {
        addToast("Failed to update follow status", "error");
      }
    } catch (error) {
      console.error("Follow toggle error:", error);
      addToast("Failed to update follow status", "error");
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
