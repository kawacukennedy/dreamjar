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

export default router;
