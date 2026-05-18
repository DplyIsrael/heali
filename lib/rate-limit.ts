import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

/**
 * Lightweight rate-limit wrapper around Upstash. Returns a permissive
 * `{ success: true }` when no UPSTASH_REDIS_* env vars are set so dev
 * environments without Redis don't fail-closed. In production with the
 * env vars present, exceeding the limit yields `{ success: false, retryAfter }`.
 *
 * Identifier defaults to the caller's IP (from x-forwarded-for); pass a
 * custom one (e.g. user id) for per-user limits.
 */

let redisClient: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redisClient = new Redis({ url, token });
  return redisClient;
}

function getLimiter(bucket: string, max: number, windowSeconds: number): Ratelimit | null {
  const key = `${bucket}:${max}:${windowSeconds}`;
  if (limiters.has(key)) return limiters.get(key)!;
  const redis = getRedis();
  if (!redis) return null;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
    analytics: false,
    prefix: `rl:${bucket}`,
  });
  limiters.set(key, limiter);
  return limiter;
}

async function callerIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export interface RateLimitParams {
  /** Logical bucket name — different buckets have independent counts. */
  bucket: string;
  /** Max requests per window. */
  max: number;
  /** Window length in seconds. */
  windowSeconds: number;
  /** Override the default identifier (IP); use for per-user limits. */
  identifier?: string;
}

export async function checkRateLimit(
  params: RateLimitParams
): Promise<{ success: true } | { success: false; retryAfterSeconds: number }> {
  const limiter = getLimiter(params.bucket, params.max, params.windowSeconds);
  // No Upstash creds configured → don't fail-closed in dev/preview.
  if (!limiter) return { success: true };

  const identifier = params.identifier ?? (await callerIp());
  const result = await limiter.limit(identifier);
  if (result.success) return { success: true };
  return {
    success: false,
    retryAfterSeconds: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
  };
}
