import { prisma } from "@/lib/prisma";

export const noticeCategories = ["전체", "대회 안내", "일정", "규정", "선수 안내", "긴급"];

export type NoticeAttachmentView = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url?: string;
};

export type NoticeView = {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  thumbnailUrl?: string;
  publishedAt: string;
  publishedLabel: string;
  isPinned?: boolean;
  attachments: NoticeAttachmentView[];
};

const seededNotices: NoticeView[] = [
  {
    id: "2026-application-guide",
    title: "제7회 경희대학교 총장배 골프대회 참가 신청 안내",
    category: "대회 안내",
    summary:
      "참가 신청은 이메일 접수 후 운영진 확인을 거쳐 확정됩니다. 선수 등록 상태는 관리자 승인 후 PLAYER로 전환됩니다.",
    content:
      "제7회 경희대학교 총장배 골프대회 참가 신청은 khusports2026@gmail.com 이메일 접수로 진행됩니다. 참가자는 신청서와 필수 확인 자료를 제출해야 하며, 운영진 검토 후 참가 확정 안내를 받습니다. 일반 회원으로 가입한 사용자는 관리자 승인 후 선수 권한으로 전환됩니다.",
    publishedAt: "2026-05-10T09:00:00.000Z",
    publishedLabel: "2026.05.10",
    isPinned: true,
    attachments: []
  },
  {
    id: "2026-schedule-overview",
    title: "대회 일정 및 주요 운영 시간 안내",
    category: "일정",
    summary:
      "라운드별 체크인, 스타트 시간, 결과 공개 시점을 사전에 확인할 수 있도록 일정 정보를 제공합니다.",
    content:
      "대회 운영 시간은 공식 일정 페이지와 공지사항을 통해 순차적으로 공개됩니다. 기상 상황이나 코스 운영 사정으로 일정이 변경될 경우, 본 공지사항과 등록된 연락처 안내를 통해 변경 사항을 고지합니다.",
    publishedAt: "2026-05-09T09:00:00.000Z",
    publishedLabel: "2026.05.09",
    attachments: []
  },
  {
    id: "2026-score-privacy",
    title: "경기 결과 공개 범위 및 스코어카드 조회 정책",
    category: "규정",
    summary:
      "공개 리더보드는 순위, 이름, 총타수까지만 표시하며 상세 스코어카드는 본인과 관리자만 조회할 수 있습니다.",
    content:
      "경기 결과 공개 화면에는 순위, 선수 이름, 총타수 등 공식 결과 요약만 표시됩니다. 홀별 상세 스코어카드는 로그인한 본인과 권한을 가진 관리자만 조회할 수 있으며, 타인의 상세 기록은 공개하지 않습니다.",
    publishedAt: "2026-05-08T09:00:00.000Z",
    publishedLabel: "2026.05.08",
    attachments: []
  },
  {
    id: "2026-equipment-check",
    title: "선수 장비 확인 및 현장 체크인 유의사항",
    category: "선수 안내",
    summary:
      "현장 체크인 시 본인 확인과 장비 확인 절차가 진행됩니다. 운영진 안내에 따라 지정 시간 내 도착해 주세요.",
    content:
      "참가 선수는 지정된 체크인 시간 내 현장 데스크에서 본인 확인 절차를 완료해야 합니다. 장비 확인이 필요한 경우 운영진이 별도 안내하며, 경기 진행에 영향을 줄 수 있는 변경 사항은 즉시 공지됩니다.",
    publishedAt: "2026-05-07T09:00:00.000Z",
    publishedLabel: "2026.05.07",
    attachments: []
  }
];

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

function isDatabaseConfigured() {
  const databaseUrl = process.env.DATABASE_URL;
  return Boolean(databaseUrl && !databaseUrl.includes("YOUR-PASS") && !databaseUrl.includes("YOUR"));
}

function logNoticeFallback(message: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, error);
  }
}

function plainTextFromContent(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(date).replace(/\.\s?/g, ".").replace(/\.$/, "");
}

function toNoticeView(notice: {
  id: string;
  title: string;
  content: string;
  category: string | null;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    r2Key: string;
    isPublic: boolean;
  }>;
}): NoticeView {
  const publishedAt = notice.publishedAt ?? notice.createdAt;
  const summary = plainTextFromContent(notice.content).slice(0, 118);

  return {
    id: notice.id,
    title: notice.title,
    category: notice.category ?? "대회 안내",
    summary: summary.length === 118 ? `${summary}...` : summary,
    content: notice.content,
    thumbnailUrl: notice.thumbnailUrl ?? undefined,
    publishedAt: publishedAt.toISOString(),
    publishedLabel: formatDate(publishedAt),
    attachments:
      notice.attachments?.map((attachment) => ({
        id: attachment.id,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        url: attachment.isPublic && process.env.R2_PUBLIC_BASE_URL
          ? `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${attachment.r2Key}`
          : undefined
      })) ?? []
  };
}

export function getSeedNoticeStaticParams() {
  return seededNotices.map((notice) => ({ id: notice.id }));
}

export async function listPublishedNotices(): Promise<NoticeView[]> {
  if (!isDatabaseConfigured()) {
    return seededNotices;
  }

  try {
    const notices = await prisma.notice.findMany({
      where: {
        OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }]
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: { attachments: true },
      take: 30
    });

    return notices.length > 0 ? notices.map(toNoticeView) : seededNotices;
  } catch (error) {
    logNoticeFallback("Falling back to seeded notices.", error);
    return seededNotices;
  }
}

export async function listAdminNotices(): Promise<NoticeView[]> {
  if (!isDatabaseConfigured()) {
    return seededNotices;
  }

  try {
    const notices = await prisma.notice.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: { attachments: true },
      take: 50
    });

    return notices.length > 0 ? notices.map(toNoticeView) : seededNotices;
  } catch (error) {
    logNoticeFallback("Falling back to seeded admin notices.", error);
    return seededNotices;
  }
}

export async function getPublishedNotice(id: string): Promise<NoticeView | null> {
  if (!isDatabaseConfigured()) {
    return seededNotices.find((notice) => notice.id === id) ?? null;
  }

  try {
    const notice = await prisma.notice.findFirst({
      where: {
        id,
        OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }]
      },
      include: { attachments: true }
    });

    return notice ? toNoticeView(notice) : seededNotices.find((item) => item.id === id) ?? null;
  } catch (error) {
    logNoticeFallback("Falling back to seeded notice detail.", error);
    return seededNotices.find((notice) => notice.id === id) ?? null;
  }
}
