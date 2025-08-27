import redis from "@shared/redis";
import { TooManyRequestsError } from "@shared/error";

/**
 * Increment a key and ensure it has TTL. Returns the current count.
 * Uses simple INCR + EXPIRE pattern; acceptable for dev and small scale.
 */
export const incrWithTTL = async (key: string, ttlSeconds: number) => {
  if (redis.status !== "ready") {
    // Fail-open: if Redis not ready, return a low-risk value (0)
    return 0;
  }

  const count = await redis.incr(key);
  // If new key, set expire
  if (count === 1) {
    await redis.expire(key, ttlSeconds);
  }
  return count;
};

export const resetKey = async (key: string) => {
  if (redis.status !== "ready") return;
  await redis.del(key);
};
