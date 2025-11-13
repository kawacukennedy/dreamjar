import express from "express";
import crypto from "crypto";
import { authenticate, AuthRequest } from "../middleware/auth";
import Webhook from "../models/Webhook";

const router = express.Router();

// GET /webhook (list user's webhooks)
router.get("/", authenticate, async (req: AuthRequest, res) => {
  const webhooks = await Webhook.find({ userId: req.userId! });
  res.json({ webhooks });
});

// POST /webhook
router.post("/", authenticate, async (req: AuthRequest, res) => {
  const { url, events } = req.body;

  const secret = crypto.randomBytes(32).toString("hex");

  const webhook = new Webhook({
    userId: req.userId!,
    url,
    events,
    secret,
  });

  await webhook.save();
  res.json({ webhook });
});

// DELETE /webhook/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  const webhook = await Webhook.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId!,
  });

  if (!webhook) return res.status(404).json({ error: "Webhook not found" });

  res.json({ message: "Webhook deleted" });
});

export default router;
