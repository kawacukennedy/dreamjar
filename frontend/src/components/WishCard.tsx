import React from "react";
import { Link } from "react-router-dom";
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
}

interface WishCardProps {
  jar: WishJar;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const WishCard: React.FC<WishCardProps> = React.memo(
  ({ jar, favorites, onToggleFavorite }) => {
    const { trackWishView } = useAnalytics();
    const progress = (jar.pledgedAmount / jar.stakeAmount) * 100;

    const handleViewDetails = () => {
      trackWishView(jar._id, jar.title);
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-fade-in cursor-pointer group touch-manipulation">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg">{jar.title}</h3>
            {jar.category && (
              <span className="text-sm text-primary font-medium">
                {jar.category}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip
              content={
                favorites.includes(jar._id)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(jar._id);
                }}
                className="text-2xl hover:scale-110 transition-all duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 touch-manipulation"
                aria-label="Toggle favorite"
              >
                {favorites.includes(jar._id) ? "❤️" : "🤍"}
              </button>
            </Tooltip>
            <Badge
              variant={
                jar.status === "Active"
                  ? "info"
                  : jar.status === "ResolvedSuccess"
                    ? "success"
                    : "danger"
              }
              size="sm"
            >
              {jar.status}
            </Badge>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {jar.description}
        </p>
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Pledged: {jar.pledgedAmount / 1000000000} TON</span>
            <span>Goal: {jar.stakeAmount / 1000000000} TON</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
        <p className="text-sm text-gray-500 mb-2">
          By:{" "}
          {jar.ownerId.displayName ||
            jar.ownerId.walletAddress.slice(0, 6) + "..."}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Deadline: {new Date(jar.deadline).toLocaleDateString()}
        </p>
        <div className="flex space-x-2">
          <ShareButton url={`/wish/${jar._id}`} title={jar.title} />
          <Link
            to={`/wish/${jar._id}`}
            onClick={handleViewDetails}
            className="flex-1 text-center bg-primary text-white py-3 sm:py-2 rounded hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-manipulation text-base"
          >
            View Details
          </Link>
        </div>
      </div>
    );
  },
);

WishCard.displayName = "WishCard";

export default WishCard;
