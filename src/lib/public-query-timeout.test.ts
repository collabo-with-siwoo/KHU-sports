import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicQueryTimeoutError, withPublicQueryTimeout } from "@/lib/public-query-timeout";

describe("withPublicQueryTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("returns the query result when it resolves before the public timeout", async () => {
    await expect(withPublicQueryTimeout("fast query", Promise.resolve("ok"))).resolves.toBe("ok");
  });

  it("allows moderately slow public reads by default", async () => {
    vi.useFakeTimers();
    vi.unstubAllEnvs();

    const query = new Promise((resolve) => {
      setTimeout(() => resolve("db result"), 2_000);
    });
    const result = withPublicQueryTimeout("cold public query", query);

    await vi.advanceTimersByTimeAsync(2_000);

    await expect(result).resolves.toBe("db result");
  });

  it("rejects with a timeout error when a public query hangs", async () => {
    vi.stubEnv("PUBLIC_QUERY_TIMEOUT_MS", "250");

    await expect(withPublicQueryTimeout("slow query", new Promise(() => undefined))).rejects.toBeInstanceOf(
      PublicQueryTimeoutError
    );
  });
});
