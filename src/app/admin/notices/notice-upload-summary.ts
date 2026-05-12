export const NOTICE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const NOTICE_DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;
export const NOTICE_SERVER_ACTION_BODY_LIMIT_BYTES = 8 * 1024 * 1024;

type UploadLike = {
  size: number;
};

export function formatNoticeUploadBytes(bytes: number) {
  const mb = 1024 * 1024;

  if (bytes >= mb) {
    const value = bytes / mb;
    const displayValue = Number.isInteger(value) ? value : Math.ceil(value * 10) / 10;
    return `${Number.isInteger(displayValue) ? displayValue.toFixed(0) : displayValue.toFixed(1)}MB`;
  }

  return `${Math.ceil(bytes / 1024).toLocaleString("ko-KR")}KB`;
}

export function createNoticeUploadSummary(files: UploadLike[], limitBytes: number) {
  const usedBytes = files.reduce((sum, file) => sum + file.size, 0);

  return {
    usedBytes,
    limitBytes,
    label: `${formatNoticeUploadBytes(usedBytes)} / ${formatNoticeUploadBytes(limitBytes)}`,
    isOverLimit: usedBytes > limitBytes
  };
}
