import { afterEach, describe, expect, it, vi } from "vitest";
import { listPublishedNotices } from "@/lib/notices";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    notice: {
      findMany: vi.fn()
    }
  }
}));

describe("notice fallback content", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps the official 27th KHU tournament notice visible when the database is unavailable", async () => {
    vi.stubEnv("DATABASE_URL", "");

    const notices = await listPublishedNotices();

    expect(notices[0]?.title).toContain("제27회 경희대학교 총장배");
  });
});
