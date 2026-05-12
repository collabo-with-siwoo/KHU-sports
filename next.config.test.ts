import { describe, expect, it } from "vitest";

import nextConfig from "./next.config";

describe("Next.js upload configuration", () => {
  it("allows notice application packet uploads through Server Actions", () => {
    const experimental = nextConfig.experimental as {
      serverActions?: { bodySizeLimit?: string | number };
    };

    expect(experimental.serverActions?.bodySizeLimit).toBe("8mb");
  });
});
