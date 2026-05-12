import { describe, expect, it } from "vitest";
import { buildPublicR2Url, createNoticeObjectKey, validateNoticeUpload } from "./r2-storage";

describe("notice R2 storage helpers", () => {
  it("builds stable notice object keys with sanitized filenames", () => {
    expect(createNoticeObjectKey("notice-id", "제27회 경희대학교 총장배 전국 골프대회.png")).toMatch(
      /^notices\/notice-id\/[a-f0-9-]+-27\.png$/
    );
  });

  it("keeps safe ascii filename stems in generated object keys", () => {
    expect(createNoticeObjectKey("notice-id", "application-guide.final.pdf")).toMatch(
      /^notices\/notice-id\/[a-f0-9-]+-application-guide-final\.pdf$/
    );
  });

  it("rejects unsupported notice upload types", () => {
    const result = validateNoticeUpload({
      name: "script.exe",
      size: 100,
      type: "application/x-msdownload"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("지원하지 않는 파일 형식");
    }
  });

  it("rejects oversized images", () => {
    const result = validateNoticeUpload({
      name: "poster.png",
      size: 10 * 1024 * 1024 + 1,
      type: "image/png"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("이미지는 최대 10MB");
    }
  });

  it("builds public R2 URLs without duplicate slashes", () => {
    expect(buildPublicR2Url("https://pub.example.r2.dev/", "/notices/a/file.pdf")).toBe(
      "https://pub.example.r2.dev/notices/a/file.pdf"
    );
  });
});
