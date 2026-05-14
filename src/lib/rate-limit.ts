export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function isRateLimitEnabled() {
  return process.env.RATE_LIMIT_ENABLED !== "false";
}

function normalizeKeyPart(part: string | number | null | undefined) {
  const normalized = String(part ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .slice(0, 128);

  return normalized || "unknown";
}

export function getRateLimitKey(parts: Array<string | number | null | undefined>) {
  return parts.map(normalizeKeyPart).join(":");
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
  now = new Date()
): RateLimitDecision {
  const resetAt = now.getTime() + options.windowMs;

  if (!isRateLimitEnabled()) {
    return {
      allowed: true,
      limit: options.limit,
      remaining: options.limit,
      resetAt: new Date(resetAt)
    };
  }

  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now.getTime()) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt
    });

    return {
      allowed: true,
      limit: options.limit,
      remaining: Math.max(options.limit - 1, 0),
      resetAt: new Date(resetAt)
    };
  }

  existing.count += 1;

  return {
    allowed: existing.count <= options.limit,
    limit: options.limit,
    remaining: Math.max(options.limit - existing.count, 0),
    resetAt: new Date(existing.resetAt)
  };
}

export function resetRateLimitForTests() {
  rateLimitStore.clear();
}
