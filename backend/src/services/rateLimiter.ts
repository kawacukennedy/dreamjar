import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "./cache";

export const userRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "user_rl",
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

export const apiKeyRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "apikey_rl",
  points: 1000, // Higher limit for API keys
  duration: 60,
});
