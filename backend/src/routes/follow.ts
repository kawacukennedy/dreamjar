import express from "express";
import Follow from "../models/Follow";
import User from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";
import { logAction } from "../services/audit";
import { createNotification } from "../services/notification";
import { isFeatureEnabled } from "../services/featureFlags";
import { trackEvent } from "../services/analytics";

const router = express.Router();

// POST /follow/:userId - Follow a user
router.post("/:userId", authenticate, async (req: AuthRequest, res) => {
  const targetUserId = req.params.userId;

  if (targetUserId === req.userId) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // Check if already following
  const existingFollow = await Follow.findOne({
    follower: req.userId,
    following: targetUserId,
  });

  if (existingFollow) {
    return res.status(400).json({ error: "Already following this user" });
  }

  const follow = new Follow({
    follower: req.userId,
    following: targetUserId,
  });

  await follow.save();

  // Audit log
  await logAction(req.userId, "follow", "user", targetUserId, {}, req);

  // Track analytics
  await trackEvent(
    "user_followed",
    req.userId,
    { followedUserId: targetUserId },
    req,
  );

  // Notify the followed user
  if (isFeatureEnabled("notifications")) {
    const follower = await User.findById(req.userId);
    await createNotification(
      targetUserId,
      "follow",
      `${follower?.displayName || follower?.walletAddress?.slice(0, 6) + "..." || "Someone"} started following you`,
      {
        followerName:
          follower?.displayName ||
          follower?.walletAddress?.slice(0, 6) + "..." ||
          "Anonymous",
        followerId: req.userId,
      },
    );
  }

  res.json({ message: "Successfully followed user" });
});

// DELETE /follow/:userId - Unfollow a user
router.delete("/:userId", authenticate, async (req: AuthRequest, res) => {
  const targetUserId = req.params.userId;

  const follow = await Follow.findOneAndDelete({
    follower: req.userId,
    following: targetUserId,
  });

  if (!follow) {
    return res.status(404).json({ error: "Not following this user" });
  }

  // Audit log
  await logAction(req.userId, "unfollow", "user", targetUserId, {}, req);

  // Track analytics
  await trackEvent(
    "user_unfollowed",
    req.userId,
    { unfollowedUserId: targetUserId },
    req,
  );

  res.json({ message: "Successfully unfollowed user" });
});

// GET /follow/:userId/followers - Get followers of a user
router.get("/:userId/followers", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = parseInt(req.query.skip as string) || 0;

  const followers = await Follow.find({ following: req.params.userId })
    .populate("follower", "displayName walletAddress avatarUrl")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Follow.countDocuments({ following: req.params.userId });

  res.json({
    followers: followers.map((f) => f.follower),
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    },
  });
});

// GET /follow/:userId/following - Get users that a user is following
router.get("/:userId/following", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = parseInt(req.query.skip as string) || 0;

  const following = await Follow.find({ follower: req.params.userId })
    .populate("following", "displayName walletAddress avatarUrl")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Follow.countDocuments({ follower: req.params.userId });

  res.json({
    following: following.map((f) => f.following),
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + limit < total,
    },
  });
});

// GET /follow/:userId/status - Check if current user is following target user
router.get("/:userId/status", authenticate, async (req: AuthRequest, res) => {
  const isFollowing = await Follow.exists({
    follower: req.userId,
    following: req.params.userId,
  });

  res.json({ isFollowing: !!isFollowing });
});

// GET /follow/stats/:userId - Get follow stats for a user
router.get("/stats/:userId", async (req, res) => {
  const [followersCount, followingCount] = await Promise.all([
    Follow.countDocuments({ following: req.params.userId }),
    Follow.countDocuments({ follower: req.params.userId }),
  ]);

  res.json({
    followersCount,
    followingCount,
  });
});

export default router;
