import express from "express";
import crypto from "crypto";
import { authenticate, AuthRequest } from "../middleware/auth";
import ApiKey from "../models/ApiKey";

const router = express.Router();

// GET /apikey (list user's API keys)
router.get("/", authenticate, async (req: AuthRequest, res) => {
  const apiKeys = await ApiKey.find({ userId: req.userId! }).select("-key");
  res.json({ apiKeys });
});

// POST /apikey
router.post("/", authenticate, async (req: AuthRequest, res) => {
  const { name, permissions } = req.body;

  const key = crypto.randomBytes(32).toString("hex");

  const apiKey = new ApiKey({
    userId: req.userId!,
    key,
    name,
    permissions: permissions || ["read"],
  });

  await apiKey.save();
  res.json({ apiKey: { ...apiKey.toObject(), key } });
});

// DELETE /apikey/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  const apiKey = await ApiKey.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId!,
  });

  if (!apiKey) return res.status(404).json({ error: "API key not found" });

  res.json({ message: "API key deleted" });
});

export default router;
