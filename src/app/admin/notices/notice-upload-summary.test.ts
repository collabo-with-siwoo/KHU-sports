import { describe, expect, it } from "vitest";

import {
  NOTICE_DOCUMENT_MAX_BYTES,
  NOTICE_IMAGE_MAX_BYTES,
  NOTICE_SERVER_ACTION_BODY_LIMIT_BYTES,
  createNoticeUploadSummary,
  formatNoticeUploadBytes
} from "./notice-upload-summary";

describe("notice upload summaries", () => {
  it("formats current usage against the configured image limit", () => {
    const summary = createNoticeUploadSummary([{ size: 854_449 }], NOTICE_IMAGE_MAX_BYTES);

    expect(summary).toEqual({
      usedBytes: 854_449,
      limitBytes: 10_485_760,
      label: "835KB / 10MB",
      isOverLimit: false
    });
  });

  it("flags attachment packet totals over the Server Action request limit", () => {
    const summary = createNoticeUploadSummary(
      [{ size: 5 * 1024 * 1024 }, { size: 4 * 1024 * 1024 }],
      NOTICE_SERVER_ACTION_BODY_LIMIT_BYTES
    );

    expect(summary.label).toBe("9MB / 8MB");
    expect(summary.isOverLimit).toBe(true);
  });

  it("formats individual document usage against the document validation limit", () => {
    expect(formatNoticeUploadBytes(2_136_356)).toBe("2.1MB");
    expect(formatNoticeUploadBytes(NOTICE_DOCUMENT_MAX_BYTES)).toBe("50MB");
  });
});
