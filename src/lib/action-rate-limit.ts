import {
  checkRateLimit,
  getRateLimitKey,
  type RateLimitDecision,
  type RateLimitOptions
} from "@/lib/rate-limit";

export const RATE_LIMIT_MESSAGE = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";

export type RateLimitedAction =
  | "member-login"
  | "admin-login"
  | "signup"
  | "password-reset"
  | "player-score-submit";

export const ACTION_RATE_LIMITS: Record<RateLimitedAction, RateLimitOptions> = {
  "member-login": { limit: 8, windowMs: 60_000 },
  "admin-login": { limit: 5, windowMs: 60_000 },
  signup: { limit: 5, windowMs: 60_000 },
  "password-reset": { limit: 5, windowMs: 60_000 },
  "player-score-submit": { limit: 20, windowMs: 60_000 }
};

export function checkActionRateLimit(
  action: RateLimitedAction,
  parts: Array<string | number | null | undefined>,
  now?: Date
): RateLimitDecision {
  return checkRateLimit(
    getRateLimitKey(["action", action, ...parts]),
    ACTION_RATE_LIMITS[action],
    now
  );
}
