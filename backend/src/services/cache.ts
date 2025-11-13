import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

export const getCache = async (key: string): Promise<string | null> => {
  return await redis.get(key);
};

export const setCache = async (
  key: string,
  value: string,
  ttl: number = 300,
): Promise<void> => {
  await redis.setex(key, ttl, value);
};

export const deleteCache = async (key: string): Promise<void> => {
  await redis.del(key);
};

export default redis;
