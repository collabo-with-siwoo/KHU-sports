"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import {
  buildPublicR2Url,
  createNoticeObjectKey,
  uploadNoticeFileToR2,
  validateNoticeUpload
} from "@/lib/r2-storage";

export type NoticeActionState = {
  status: "idle" | "success" | "error";
  message: string;
  noticeId?: string;
};

type NoticeCreateData = Prisma.NoticeUncheckedCreateInput;

type NoticeCreateDependencies = {
  adminId: string;
  publicBucketName: string;
  publicBaseUrl: string;
  uploadFile: (params: { bucketName: string; objectKey: string; file: File }) => Promise<void>;
  createNotice: (data: NoticeCreateData) => Promise<unknown>;
};

const noticeSchema = z.object({
  title: z.string().trim().min(2, "공지 제목을 입력해주세요."),
  category: z.string().trim().min(1, "공지 분류를 선택해주세요."),
  content: z.string().trim().min(5, "공지 본문을 입력해주세요."),
  publishNow: z.boolean()
});

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.name.trim().length > 0 && value.size > 0;
}

function getUploadFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter(isUploadFile);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNoticeContent(value: string) {
  return value
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function r2EnvValue(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} 환경 변수가 설정되지 않았습니다.`);
  }

  return value;
}

export async function createNoticeWithDependencies(
  formData: FormData,
  dependencies: NoticeCreateDependencies
): Promise<NoticeActionState> {
  const parsed = noticeSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? ""),
    content: String(formData.get("content") ?? ""),
    publishNow: String(formData.get("publishNow") ?? "") === "on"
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "공지 정보를 확인해주세요."
    };
  }

  const noticeId = randomUUID();
  const thumbnail = formData.get("thumbnail");
  const attachments = getUploadFiles(formData, "attachments");
  let thumbnailUrl: string | null = null;
  const attachmentRows: Prisma.NoticeAttachmentUncheckedCreateWithoutNoticeInput[] = [];

  if (isUploadFile(thumbnail)) {
    const validation = validateNoticeUpload(thumbnail);

    if (!validation.ok) {
      return { status: "error", message: validation.message };
    }

    if (validation.category !== "image") {
      return { status: "error", message: "썸네일은 이미지 파일만 업로드할 수 있습니다." };
    }

    const objectKey = createNoticeObjectKey(noticeId, thumbnail.name);
    await dependencies.uploadFile({
      bucketName: dependencies.publicBucketName,
      objectKey,
      file: thumbnail
    });
    thumbnailUrl = buildPublicR2Url(dependencies.publicBaseUrl, objectKey);
  }

  for (const file of attachments) {
    const validation = validateNoticeUpload(file);

    if (!validation.ok) {
      return { status: "error", message: `${file.name}: ${validation.message}` };
    }

    const objectKey = createNoticeObjectKey(noticeId, file.name);
    await dependencies.uploadFile({
      bucketName: dependencies.publicBucketName,
      objectKey,
      file
    });
    attachmentRows.push({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      r2Key: objectKey,
      isPublic: true
    });
  }

  await dependencies.createNotice({
    id: noticeId,
    authorId: dependencies.adminId,
    title: parsed.data.title,
    category: parsed.data.category,
    content: formatNoticeContent(parsed.data.content),
    thumbnailUrl,
    publishedAt: parsed.data.publishNow ? new Date() : null,
    attachments: {
      create: attachmentRows
    }
  });

  return {
    status: "success",
    message: "공지사항을 저장했습니다.",
    noticeId
  };
}

export async function createNoticeAction(
  _previousState: NoticeActionState,
  formData: FormData
): Promise<NoticeActionState> {
  const admin = await requireAdminPermission("notices", "write", "/admin/notices/new");

  try {
    const result = await createNoticeWithDependencies(formData, {
      adminId: admin.id,
      publicBucketName: r2EnvValue("R2_BUCKET_PUBLIC"),
      publicBaseUrl: r2EnvValue("R2_PUBLIC_BASE_URL"),
      uploadFile: uploadNoticeFileToR2,
      createNotice: (data) => prisma.notice.create({ data })
    });

    if (result.status === "success") {
      revalidatePath("/");
      revalidatePath("/notices");
      revalidatePath("/admin/notices");

      if (result.noticeId) {
        revalidatePath(`/notices/${result.noticeId}`);
      }
    }

    return result;
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "공지사항을 저장하지 못했습니다."
    };
  }
}
