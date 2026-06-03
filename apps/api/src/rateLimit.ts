const DAILY_LIMIT = 200;
const WINDOW_MS = 24 * 60 * 60 * 1000;

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(deviceId: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  let bucket = buckets.get(deviceId);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    bucket = { count: 0, windowStart: now };
    buckets.set(deviceId, bucket);
  }

  if (bucket.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: DAILY_LIMIT - bucket.count };
}
