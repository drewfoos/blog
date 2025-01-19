// app/lib/rate-limit.ts
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function rateLimit(
  ip: string,
  limit: number = 5,
  window: number = 60 * 60 // 1 hour in seconds
) {
  const key = `rate_limit:${ip}`
  
  try {
    const requests = await redis.incr(key)
    
    if (requests === 1) {
      await redis.expire(key, window)
    }
    
    return {
      success: requests <= limit,
      remaining: Math.max(0, limit - requests),
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow the request if rate limiting fails
    return { success: true, remaining: 1 }
  }
}