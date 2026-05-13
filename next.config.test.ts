import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("next security config", () => {
  it("allows notice application packet uploads through Server Actions", () => {
    const experimental = nextConfig.experimental as {
      serverActions?: { bodySizeLimit?: string | number };
    };

    expect(experimental.serverActions?.bodySizeLimit).toBe("8mb");
  });

  it("sets baseline browser security headers for every route", async () => {
    const headers = await nextConfig.headers?.();
    const allRouteHeaders = headers?.find((entry) => entry.source === "/:path*")?.headers ?? [];
    const headerMap = new Map(allRouteHeaders.map((header) => [header.key, header.value]));

    expect(headerMap.get("Strict-Transport-Security")).toContain("max-age=31536000");
    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerMap.get("Permissions-Policy")).toContain("camera=()");
    expect(headerMap.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("does not allow arbitrary remote image hosts", () => {
    const hostnames = nextConfig.images?.remotePatterns?.map((pattern) => pattern.hostname);

    expect(hostnames).toContain("lh3.googleusercontent.com");
    expect(hostnames).toContain("**.r2.dev");
    expect(hostnames).not.toContain("**");
  });
});
