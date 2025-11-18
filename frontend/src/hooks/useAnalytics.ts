import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

// Dynamic import to avoid issues if PostHog is not available
let posthog: any = null;
try {
  posthog = require("posthog-js");
} catch (e) {
  // PostHog not available
}

export const useAnalytics = () => {
  const { user } = useAuth();

  // Identify user when they log in
  useEffect(() => {
    if (posthog && user) {
      posthog.identify(user.id, {
        displayName: user.displayName,
        walletAddress: user.walletAddress,
      });
    }
  }, [user]);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  };

  const trackPageView = (pageName: string) => {
    if (posthog) {
      posthog.capture("$pageview", { page: pageName });
    }
  };

  const trackSearch = (query: string, filters?: Record<string, any>) => {
    trackEvent("search_performed", { query, ...filters });
  };

  const trackWishView = (wishId: string, wishTitle: string) => {
    trackEvent("wish_viewed", { wishId, wishTitle });
  };

  const trackWishCreate = (wishData: Record<string, any>) => {
    trackEvent("wish_created", wishData);
  };

  const trackPledge = (wishId: string, amount: number) => {
    trackEvent("pledge_made", { wishId, amount });
  };

  const trackFollow = (targetUserId: string) => {
    trackEvent("user_followed", { targetUserId });
  };

  const trackUnfollow = (targetUserId: string) => {
    trackEvent("user_unfollowed", { targetUserId });
  };

  const trackShare = (
    platform: string,
    contentType: string,
    contentId: string,
  ) => {
    trackEvent("content_shared", { platform, contentType, contentId });
  };

  return {
    trackEvent,
    trackPageView,
    trackSearch,
    trackWishView,
    trackWishCreate,
    trackPledge,
    trackFollow,
    trackUnfollow,
    trackShare,
  };
};
