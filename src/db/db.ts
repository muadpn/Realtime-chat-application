import { Redis } from "@upstash/redis";

function dbUrl() {
  const RedisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const RedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!RedisUrl || RedisUrl.length < 1) {
    throw new Error("UPSTASH_REDIS_REST_URL NOT FOUND");
  }
  if (!RedisToken || RedisToken.length < 1) {
    throw new Error("UPSTASH_REDIS_REST_TOKEN NOT FOUND");
  }

  return {
    RedisUrl,
    RedisToken,
  };
}

export const db = new Redis({
  url: dbUrl().RedisUrl,
  token: dbUrl().RedisToken,
});


