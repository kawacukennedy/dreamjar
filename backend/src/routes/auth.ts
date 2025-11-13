import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";

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
router.post("/wallet-challenge", async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Address required" });

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
router.post("/wallet-verify", async (req, res) => {
  const { address, signedMessage, challengeMessage } = req.body;
  if (!address || !signedMessage || !challengeMessage)
    return res
      .status(400)
      .json({ error: "Address, signedMessage, and challengeMessage required" });

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
router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  const { displayName, avatarUrl } = req.body;

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (displayName !== undefined) user.displayName = displayName;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  user.lastSeen = new Date();
  await user.save();

  res.json({ user });
});

export default router;
