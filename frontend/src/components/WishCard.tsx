import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProgressBar from "./ProgressBar";
import ShareButton from "./ShareButton";
import Badge from "./Badge";
import Tooltip from "./Tooltip";
import { useAnalytics } from "../hooks/useAnalytics";

interface WishJar {
  _id: string;
  title: string;
  description: string;
  stakeAmount: number;
  pledgedAmount: number;
  deadline: string;
  status: string;
  category?: string;
  ownerId: { displayName?: string; walletAddress: string };
  sponsor?: {
    name: string;
    logo_url?: string;
    website?: string;
  };
}

interface WishCardProps {
  jar: WishJar;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const WishCard: React.FC<WishCardProps> = React.memo(
  ({ jar, favorites, onToggleFavorite }) => {
    const { t } = useTranslation();
    const { trackWishView } = useAnalytics();
    const progress = (jar.pledgedAmount / jar.stakeAmount) * 100;

    const handleViewDetails = () => {
      trackWishView(jar._id, jar.title);
    };

    const handleCardClick = () => {
      trackWishView(jar._id, jar.title);
      // Navigate to details page
      window.location.href = `/wish/${jar._id}`;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick();
      }
    };

    return (
      <div
        className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-level1 hover:shadow-level2 transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-dream-blue focus:ring-offset-2 flex"
        tabIndex={0}
        role="button"
        aria-label={t("view_dream_details", { title: jar.title })}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
      >
        {/* Thumbnail */}
        <div className="w-30 h-30 bg-neutral-200 dark:bg-neutral-800 rounded-md flex-shrink-0 mr-4">
          {/* Placeholder for thumbnail */}
          <div className="w-full h-full flex items-center justify-center text-neutral-500">
            📸
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg truncate">{jar.title}</h3>
              {jar.category && (
                <span className="text-sm text-violet font-medium">
                  {jar.category}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <Badge
                variant={
                  jar.status === "active"
                    ? "info"
                    : jar.status === "verified"
                      ? "success"
                      : "error"
                }
                size="sm"
              >
                {jar.status}
              </Badge>
              {jar.sponsor && (
                <Badge variant="warning" size="sm">
                  Sponsored
                </Badge>
              )}
            </div>
          </div>

          <p className="text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2 text-sm">
            {jar.description}
          </p>

          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Pledged: {jar.pledgedAmount / 1000000000} TON</span>
              <span>Goal: {jar.stakeAmount / 1000000000} TON</span>
            </div>
            <ProgressBar progress={progress} />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-neutral-500">
              By:{" "}
              {jar.ownerId.displayName ||
                jar.ownerId.walletAddress.slice(0, 6) + "..."}
            </p>
            <p className="text-xs text-neutral-500">
              Deadline: {new Date(jar.deadline).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

WishCard.displayName = "WishCard";

export default WishCard;
