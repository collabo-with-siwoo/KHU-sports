import { describe, expect, it, vi } from "vitest";
import { createNoticeWithDependencies } from "./actions";

function fileFrom(content: string, name: string, type: string) {
  return new File([content], name, { type });
}

describe("admin notice creation", () => {
  it("rejects blank title and content before uploading files", async () => {
    const formData = new FormData();
    formData.set("title", "");
    formData.set("content", "");

    const uploadFile = vi.fn();
    const createNotice = vi.fn();
    const result = await createNoticeWithDependencies(formData, {
      adminId: "00000000-0000-0000-0000-000000000001",
      publicBucketName: "khusports-media",
      publicBaseUrl: "https://pub.example.r2.dev",
      uploadFile,
      createNotice
    });

    expect(result.status).toBe("error");
    expect(result.message).toContain("제목");
    expect(uploadFile).not.toHaveBeenCalled();
    expect(createNotice).not.toHaveBeenCalled();
  });

  it("uploads a poster thumbnail and application PDF attachment before creating the notice", async () => {
    const formData = new FormData();
    formData.set("title", "제27회 경희대학교 총장배 전국 골프대회 참가 신청 안내");
    formData.set("category", "대회 안내");
    formData.set("content", "참가 신청 관련 문서를 확인해주세요.");
    formData.set("publishNow", "on");
    formData.set(
      "thumbnail",
      fileFrom("poster", "제27회 경희대학교 총장배 전국 골프대회.png", "image/png")
    );
    formData.append(
      "attachments",
      fileFrom("pdf", "(붙임 1.)제27회경희대학교총장배 대회요강.pdf", "application/pdf")
    );

    const uploadFile = vi.fn().mockResolvedValue(undefined);
    const createNotice = vi.fn().mockResolvedValue(undefined);
    const result = await createNoticeWithDependencies(formData, {
      adminId: "00000000-0000-0000-0000-000000000001",
      publicBucketName: "khusports-media",
      publicBaseUrl: "https://pub.example.r2.dev",
      uploadFile,
      createNotice
    });

    expect(result.status).toBe("success");
    expect(uploadFile).toHaveBeenCalledTimes(2);
    expect(createNotice).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "제27회 경희대학교 총장배 전국 골프대회 참가 신청 안내",
        category: "대회 안내",
        authorId: "00000000-0000-0000-0000-000000000001",
        thumbnailUrl: expect.stringMatching(/^https:\/\/pub\.example\.r2\.dev\/notices\/.+\.png$/),
        publishedAt: expect.any(Date),
        attachments: {
          create: [
            expect.objectContaining({
              fileName: "(붙임 1.)제27회경희대학교총장배 대회요강.pdf",
              mimeType: "application/pdf",
              isPublic: true,
              r2Key: expect.stringMatching(/^notices\/.+\.pdf$/)
            })
          ]
        }
      })
    );
  });
});
