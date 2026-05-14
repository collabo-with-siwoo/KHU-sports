import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getRateLimitKey, resetRateLimitForTests } from "@/lib/rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
  resetRateLimitForTests();
});

describe("checkRateLimit", () => {
  it("allows requests up to the limit and blocks the next request in the same window", () => {
    const options = { limit: 2, windowMs: 60_000 };
    const now = new Date("2026-05-14T00:00:00.000Z");

    expect(checkRateLimit("login:user:ip", options, now)).toMatchObject({
      allowed: true,
      remaining: 1
    });
    expect(checkRateLimit("login:user:ip", options, now)).toMatchObject({
      allowed: true,
      remaining: 0
    });
    expect(checkRateLimit("login:user:ip", options, now)).toMatchObject({
      allowed: false,
      remaining: 0
    });
  });

  it("opens a new window after the previous window expires", () => {
    const options = { limit: 1, windowMs: 60_000 };
    const start = new Date("2026-05-14T00:00:00.000Z");
    const later = new Date("2026-05-14T00:01:00.001Z");

    expect(checkRateLimit("reset:user:ip", options, start).allowed).toBe(true);
    expect(checkRateLimit("reset:user:ip", options, start).allowed).toBe(false);
    expect(checkRateLimit("reset:user:ip", options, later)).toMatchObject({
      allowed: true,
      remaining: 0
    });
  });

  it("bypasses limits when RATE_LIMIT_ENABLED is false", () => {
    vi.stubEnv("RATE_LIMIT_ENABLED", "false");
    const options = { limit: 1, windowMs: 60_000 };
    const now = new Date("2026-05-14T00:00:00.000Z");

    expect(checkRateLimit("admin:ip", options, now).allowed).toBe(true);
    expect(checkRateLimit("admin:ip", options, now).allowed).toBe(true);
  });
});

describe("getRateLimitKey", () => {
  it("normalizes key parts into a stable lower-case key", () => {
    expect(getRateLimitKey([" Login ", "User@Example.COM", "  127.0.0.1  "])).toBe(
      "login:user@example.com:127.0.0.1"
    );
  });

  it("uses a safe placeholder for empty key parts", () => {
    expect(getRateLimitKey(["signup", "", null, undefined])).toBe(
      "signup:unknown:unknown:unknown"
    );
  });
});
