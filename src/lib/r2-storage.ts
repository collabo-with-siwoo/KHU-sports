import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

const allowedNoticeMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

export type NoticeUploadInput = {
  name: string;
  size: number;
  type: string;
};

export type NoticeUploadValidation =
  | { ok: true; category: "image" | "document" }
  | { ok: false; message: string };

function isImageMimeType(mimeType: string) {
  return mimeType.startsWith("image/");
}

function getExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return extension ? `.${extension}` : "";
}

function sanitizeFilenameStem(fileName: string) {
  const stem = fileName.replace(/\.[^.]+$/, "");
  const asciiStem = stem
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return asciiStem || "file";
}

export function createNoticeObjectKey(noticeId: string, fileName: string) {
  const extension = getExtension(fileName);
  const stem = sanitizeFilenameStem(fileName);

  return `notices/${noticeId}/${randomUUID()}-${stem}${extension}`;
}

export function buildPublicR2Url(baseUrl: string, objectKey: string) {
  return `${baseUrl.replace(/\/$/, "")}/${objectKey.replace(/^\//, "")}`;
}

export function validateNoticeUpload(file: NoticeUploadInput): NoticeUploadValidation {
  if (!file.name || file.size <= 0) {
    return { ok: false, message: "파일이 비어 있습니다." };
  }

  if (!allowedNoticeMimeTypes.has(file.type)) {
    return { ok: false, message: "지원하지 않는 파일 형식입니다." };
  }

  if (isImageMimeType(file.type) && file.size > IMAGE_MAX_BYTES) {
    return { ok: false, message: "이미지는 최대 10MB까지 업로드할 수 있습니다." };
  }

  if (!isImageMimeType(file.type) && file.size > DOCUMENT_MAX_BYTES) {
    return { ok: false, message: "문서는 최대 50MB까지 업로드할 수 있습니다." };
  }

  return { ok: true, category: isImageMimeType(file.type) ? "image" : "document" };
}

function createR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 환경 변수가 설정되지 않았습니다.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

export async function uploadNoticeFileToR2(params: {
  bucketName: string;
  objectKey: string;
  file: File;
}) {
  const validation = validateNoticeUpload(params.file);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const body = Buffer.from(await params.file.arrayBuffer());
  const client = createR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: params.bucketName,
      Key: params.objectKey,
      Body: body,
      ContentType: params.file.type,
      ContentLength: params.file.size
    })
  );
}
