import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

// POST /auth/wallet-challenge
router.post("/wallet-challenge", async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Address required" });

  const challengeMessage = `Sign this message to authenticate with DreamJar: ${Date.now()}`;
  res.json({ challengeMessage });
});

// POST /auth/wallet-verify
router.post("/wallet-verify", async (req, res) => {
  const { address, signedMessage, challengeMessage } = req.body;
  if (!address || !signedMessage || !challengeMessage)
    return res
      .status(400)
      .json({ error: "Address, signedMessage, and challengeMessage required" });

  // TODO: Verify signature with TON SDK
  // For now, assume valid

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

// PUT /auth/profile
router.put("/profile", authenticate, async (req, res) => {
  const { displayName } = req.body;

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (displayName) user.displayName = displayName;
  await user.save();

  res.json({ user });
});

export default router;
