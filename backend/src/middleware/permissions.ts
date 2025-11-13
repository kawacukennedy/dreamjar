import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import User from "../models/User";

export const requireRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId)
      return res.status(401).json({ error: "Not authenticated" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    req.user = user;
    next();
  };
};

export const canModerate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.userId) return res.status(401).json({ error: "Not authenticated" });

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.role !== "moderator" && user.role !== "admin") {
    return res.status(403).json({ error: "Moderation permissions required" });
  }

  req.user = user;
  next();
};
