import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import ApiKey from "../models/ApiKey";
import { userRateLimiter, apiKeyRateLimiter } from "../services/rateLimiter";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
  apiKey?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  const apiKey = req.headers["x-api-key"] as string;

  try {
    if (apiKey) {
      // Rate limit API key
      await apiKeyRateLimiter.consume(apiKey);

      // API Key authentication
      const key = await ApiKey.findOne({ key: apiKey, active: true }).populate(
        "userId",
      );
      if (!key) return res.status(401).json({ error: "Invalid API key" });

      key.lastUsed = new Date();
      await key.save();

      req.userId = key.userId._id.toString();
      req.user = key.userId;
      req.apiKey = key;
    } else if (token) {
      // Rate limit user
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secret",
      ) as any;
      await userRateLimiter.consume(decoded.userId);

      req.userId = decoded.userId;
    } else {
      return res.status(401).json({ error: "No authentication provided" });
    }

    next();
  } catch (rejRes: any) {
    if (rejRes instanceof Error) {
      return res.status(500).json({ error: "Authentication error" });
    }
    // Rate limit exceeded
    const retryAfter = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set("Retry-After", retryAfter.toString());
    res.status(429).json({ error: "Too many requests" });
  }
};
