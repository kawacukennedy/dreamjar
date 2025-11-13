import express from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { getUserNotifications, markAsRead } from "../services/notification";

const router = express.Router();

// GET /notification (user's notifications)
router.get("/", authenticate, async (req: AuthRequest, res) => {
  const notifications = await getUserNotifications(req.userId!);
  res.json({ notifications });
});

// PUT /notification/:id/read
router.put("/:id/read", authenticate, async (req: AuthRequest, res) => {
  const notification = await markAsRead(req.params.id, req.userId!);
  if (!notification)
    return res.status(404).json({ error: "Notification not found" });
  res.json({ notification });
});

export default router;
