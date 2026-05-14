import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ACTION_RATE_LIMITS,
  checkActionRateLimit,
  RATE_LIMIT_MESSAGE
} from "@/lib/action-rate-limit";
import { resetRateLimitForTests } from "@/lib/rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
  resetRateLimitForTests();
});

describe("ACTION_RATE_LIMITS", () => {
  it("defines profiles for high-risk public and authenticated actions", () => {
    expect(Object.keys(ACTION_RATE_LIMITS).sort()).toEqual([
      "admin-login",
      "member-login",
      "password-reset",
      "player-score-submit",
      "signup"
    ]);
  });

  it("uses a generic user-facing error message", () => {
    expect(RATE_LIMIT_MESSAGE).toBe("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
  });
});

describe("checkActionRateLimit", () => {
  it("blocks admin login after the configured limit", () => {
    const now = new Date("2026-05-14T00:00:00.000Z");

    for (let i = 0; i < ACTION_RATE_LIMITS["admin-login"].limit; i += 1) {
      expect(checkActionRateLimit("admin-login", ["admin@example.com", "127.0.0.1"], now).allowed)
        .toBe(true);
    }

    expect(
      checkActionRateLimit("admin-login", ["admin@example.com", "127.0.0.1"], now).allowed
    ).toBe(false);
  });

  it.each([
    "member-login",
    "signup",
    "password-reset",
    "player-score-submit"
  ] as const)("returns a tracked decision for %s", (action) => {
    const decision = checkActionRateLimit(
      action,
      ["user@example.com", "127.0.0.1"],
      new Date("2026-05-14T00:00:00.000Z")
    );

    expect(decision).toMatchObject({
      allowed: true,
      limit: ACTION_RATE_LIMITS[action].limit
    });
    expect(decision.resetAt).toBeInstanceOf(Date);
  });
});
