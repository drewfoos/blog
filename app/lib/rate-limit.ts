// lib/rate-limit.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Allow 5 requests per IP per minute
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60; // seconds

export async function rateLimit(identifier: string) {
  const key = `ratelimit:${identifier}`;

  const [requests, _] = await redis
    .pipeline()
    .incr(key)
    .expire(key, RATE_LIMIT_WINDOW)
    .exec();

  if (requests > RATE_LIMIT_REQUESTS) {
    throw new Error('Rate limit exceeded');
  }
}