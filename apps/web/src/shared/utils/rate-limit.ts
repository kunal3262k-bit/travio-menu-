const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, options?: { max?: number; windowMs?: number }) {
  const now = Date.now();
  const windowMs = options?.windowMs ?? Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  const max = options?.max ?? Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  bucket.count += 1;
  return { allowed: bucket.count <= max, remaining: Math.max(0, max - bucket.count) };
}

