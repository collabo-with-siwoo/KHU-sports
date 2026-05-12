"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { SubmitButton } from "@/app/(auth)/submit-button";
import { createNoticeAction, type NoticeActionState } from "./actions";
import {
  NOTICE_DOCUMENT_MAX_BYTES,
  NOTICE_IMAGE_MAX_BYTES,
  NOTICE_SERVER_ACTION_BODY_LIMIT_BYTES,
  createNoticeUploadSummary,
  formatNoticeUploadBytes
} from "./notice-upload-summary";

const initialState: NoticeActionState = {
  status: "idle",
  message: ""
};

const noticeCategories = ["전체", "대회 안내", "일정", "규정", "선수 안내", "긴급"];

export function NoticeForm() {
  const [state, formAction] = useActionState(createNoticeAction, initialState);
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const allUploadFiles = useMemo(
    () => [...thumbnailFiles, ...attachmentFiles],
    [attachmentFiles, thumbnailFiles]
  );
  const thumbnailSummary = createNoticeUploadSummary(thumbnailFiles, NOTICE_IMAGE_MAX_BYTES);
  const attachmentSummary = createNoticeUploadSummary(
    attachmentFiles,
    NOTICE_SERVER_ACTION_BODY_LIMIT_BYTES
  );
  const totalSummary = createNoticeUploadSummary(
    allUploadFiles,
    NOTICE_SERVER_ACTION_BODY_LIMIT_BYTES
  );

  return (
    <form action={formAction} className="admin-notice-form">
      <label>
        분류
        <select defaultValue="대회 안내" name="category">
          {noticeCategories
            .filter((category) => category !== "전체")
            .map((category) => (
              <option key={category}>{category}</option>
            ))}
        </select>
      </label>

      <label>
        제목
        <input
          name="title"
          placeholder="제27회 경희대학교 총장배 전국 골프대회 참가 신청 안내"
          required
        />
      </label>

      <label>
        본문
        <textarea
          name="content"
          placeholder="참가 신청 방법, 제출 서류, 마감일 등 공지 내용을 입력하세요"
          required
          rows={12}
        />
      </label>

      <label>
        홍보 이미지
        <input
          accept="image/png,image/jpeg,image/webp,image/avif"
          name="thumbnail"
          onChange={(event) => setThumbnailFiles(Array.from(event.currentTarget.files ?? []))}
          type="file"
        />
        <small>asset 폴더의 홍보 이미지를 업로드하면 공지 대표 이미지로 노출됩니다.</small>
        {thumbnailFiles.length > 0 ? (
          <span
            aria-live="polite"
            className={`upload-usage ${thumbnailSummary.isOverLimit ? "is-over" : ""}`}
          >
            홍보 이미지 {thumbnailSummary.label}
          </span>
        ) : null}
      </label>

      <label>
        신청 서류 첨부
        <input
          accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          multiple
          name="attachments"
          onChange={(event) => setAttachmentFiles(Array.from(event.currentTarget.files ?? []))}
          type="file"
        />
        <small>reference 폴더의 대회요강, 서약서, 동의서 PDF를 여러 개 첨부할 수 있습니다.</small>
        {attachmentFiles.length > 0 ? (
          <div
            aria-live="polite"
            className={`upload-usage-list ${attachmentSummary.isOverLimit ? "is-over" : ""}`}
          >
            <span>첨부 서류 합계 {attachmentSummary.label}</span>
            <ul>
              {attachmentFiles.map((file) => (
                <li key={`${file.name}-${file.size}`}>
                  <span>{file.name}</span>
                  <strong>
                    {formatNoticeUploadBytes(file.size)} /{" "}
                    {formatNoticeUploadBytes(NOTICE_DOCUMENT_MAX_BYTES)}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </label>

      {allUploadFiles.length > 0 ? (
        <div
          aria-live="polite"
          className={`upload-usage-total ${totalSummary.isOverLimit ? "is-over" : ""}`}
        >
          전체 업로드 {totalSummary.label}
        </div>
      ) : null}

      <label className="admin-notice-check">
        <input defaultChecked name="publishNow" type="checkbox" />
        공지 즉시 공개
      </label>

      {state.message ? <p className={`form-message ${state.status}`}>{state.message}</p> : null}
      {state.noticeId ? (
        <Link className="admin-secondary-link" href={`/notices/${state.noticeId}`}>
          공개 공지 확인
        </Link>
      ) : null}
      <SubmitButton pendingLabel="저장 중...">공지 저장</SubmitButton>
    </form>
  );
}
