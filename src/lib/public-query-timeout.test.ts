import { describe, expect, it, vi } from "vitest";
import { PublicQueryTimeoutError, withPublicQueryTimeout } from "@/lib/public-query-timeout";

describe("withPublicQueryTimeout", () => {
  it("returns the query result when it resolves before the public timeout", async () => {
    await expect(withPublicQueryTimeout("fast query", Promise.resolve("ok"))).resolves.toBe("ok");
  });

  it("rejects with a timeout error when a public query hangs", async () => {
    vi.stubEnv("PUBLIC_QUERY_TIMEOUT_MS", "250");

    await expect(withPublicQueryTimeout("slow query", new Promise(() => undefined))).rejects.toBeInstanceOf(
      PublicQueryTimeoutError
    );

    vi.unstubAllEnvs();
  });
});
