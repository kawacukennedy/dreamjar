import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Follow from "../models/Follow";
import { authenticate, AuthRequest } from "../middleware/auth";
import {
  validateWalletChallenge,
  validateWalletVerify,
  validateProfile,
} from "../middleware/validation";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         walletAddress:
 *           type: string
 *         displayName:
 *           type: string
 *         avatarUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastSeen:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /auth/wallet-challenge:
 *   post:
 *     summary: Get challenge message for wallet authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Challenge message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 challengeMessage:
 *                   type: string
 */
router.post("/wallet-challenge", validateWalletChallenge, async (req, res) => {
  const { address } = req.body;

  const challengeMessage = `Sign this message to authenticate with DreamJar: ${Date.now()}`;
  res.json({ challengeMessage });
});

/**
 * @swagger
 * /auth/wallet-verify:
 *   post:
 *     summary: Verify wallet signature and authenticate user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - signedMessage
 *               - challengeMessage
 *             properties:
 *               address:
 *                 type: string
 *               signedMessage:
 *                 type: string
 *               challengeMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token and user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwt:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post("/wallet-verify", validateWalletVerify, async (req, res) => {
  const { address, signedMessage, challengeMessage } = req.body;

  // Verify signature (mock implementation)
  // In production, use TON SDK to verify signature
  const isValid = signedMessage && challengeMessage; // Mock validation
  if (!isValid) return res.status(401).json({ error: "Invalid signature" });

  let user = await User.findOne({ walletAddress: address });
  if (!user) {
    user = new User({ walletAddress: address });
    await user.save();
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" },
  );
  res.json({ jwt: token, user });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user });
});

// PUT /auth/profile
router.put(
  "/profile",
  authenticate,
  validateProfile,
  async (req: AuthRequest, res) => {
    const { displayName, avatarUrl } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (displayName !== undefined) user.displayName = displayName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    user.lastSeen = new Date();
    await user.save();

    res.json({ user });
  },
);

// GET /auth/follow/:walletAddress - Check if current user is following the target user
router.get(
  "/follow/:walletAddress",
  authenticate,
  async (req: AuthRequest, res) => {
    const { walletAddress } = req.params;

    const targetUser = await User.findOne({ walletAddress });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    const follow = await Follow.findOne({
      follower: req.userId,
      following: targetUser._id,
    });

    res.json({ isFollowing: !!follow });
  },
);

// POST /auth/follow/:walletAddress - Follow a user
router.post(
  "/follow/:walletAddress",
  authenticate,
  async (req: AuthRequest, res) => {
    const { walletAddress } = req.params;

    const targetUser = await User.findOne({ walletAddress });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    if (req.userId === targetUser._id.toString()) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const existingFollow = await Follow.findOne({
      follower: req.userId,
      following: targetUser._id,
    });

    if (existingFollow) {
      return res.status(400).json({ error: "Already following" });
    }

    const follow = new Follow({
      follower: req.userId,
      following: targetUser._id,
    });

    await follow.save();
    res.json({ message: "Followed successfully" });
  },
);

// DELETE /auth/follow/:walletAddress - Unfollow a user
router.delete(
  "/follow/:walletAddress",
  authenticate,
  async (req: AuthRequest, res) => {
    const { walletAddress } = req.params;

    const targetUser = await User.findOne({ walletAddress });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    const follow = await Follow.findOneAndDelete({
      follower: req.userId,
      following: targetUser._id,
    });

    if (!follow) {
      return res.status(400).json({ error: "Not following" });
    }

    res.json({ message: "Unfollowed successfully" });
  },
);

// GET /auth/followers - Get followers count and list for current user
router.get("/followers", authenticate, async (req: AuthRequest, res) => {
  const followers = await Follow.find({ following: req.userId }).populate(
    "follower",
    "displayName walletAddress",
  );
  res.json({
    count: followers.length,
    followers: followers.map((f) => f.follower),
  });
});

// GET /auth/following - Get following count and list for current user
router.get("/following", authenticate, async (req: AuthRequest, res) => {
  const following = await Follow.find({ follower: req.userId }).populate(
    "following",
    "displayName walletAddress",
  );
  res.json({
    count: following.length,
    following: following.map((f) => f.following),
  });
});

export default router;
