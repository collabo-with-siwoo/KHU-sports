import type { Prisma, Score, ScoreStatus } from "@prisma/client";

export type MyScoreStatus =
  | "NOT_STARTED"
  | "DRAFT"
  | "SUBMITTED"
  | "ADMIN_CONFIRMED"
  | "ADMIN_REJECTED";

const STATUS_ALIAS: Record<string, MyScoreStatus> = {
  DRAFT: "DRAFT",
  TEMP: "DRAFT",
  TEMP_SAVED: "DRAFT",
  IN_PROGRESS: "DRAFT",
  SUBMITTED: "SUBMITTED",
  PLAYER_SUBMITTED: "SUBMITTED",
  PENDING_REVIEW: "SUBMITTED",
  REVIEW_REQUESTED: "SUBMITTED",
  ADMIN_CONFIRMED: "ADMIN_CONFIRMED",
  CONFIRMED: "ADMIN_CONFIRMED",
  APPROVED: "ADMIN_CONFIRMED",
  ADMIN_REJECTED: "ADMIN_REJECTED",
  REJECTED: "ADMIN_REJECTED",
  RETURNED: "ADMIN_REJECTED"
};

export type ScoreLike = Pick<
  Score,
  "scoreData"
  | "status"
  | "playerMemo"
  | "adminMemo"
  | "rejectionReason"
  | "submittedAt"
  | "adminConfirmedAt"
  | "rejectedAt"
>;

function stringFromScoreData(data: Prisma.JsonValue, key: string): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const value = (data as Record<string, unknown>)[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function dateFromScoreData(data: Prisma.JsonValue, key: string): Date | null {
  const raw = stringFromScoreData(data, key);
  if (!raw) {
    return null;
  }
  const parsed = new Date(raw);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function booleanFromScoreData(data: Prisma.JsonValue, key: string): boolean | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  const value = (data as Record<string, unknown>)[key];
  return typeof value === "boolean" ? value : null;
}

function normalizeStatusString(raw: string | null | undefined): MyScoreStatus | null {
  if (!raw) {
    return null;
  }
  const upper = raw.trim().toUpperCase();
  return STATUS_ALIAS[upper] ?? null;
}

export function resolveScoreStatus(score: ScoreLike, hasScore = true): MyScoreStatus {
  if (score.status) {
    return score.status as MyScoreStatus;
  }

  const fromString = normalizeStatusString(
    stringFromScoreData(score.scoreData, "status") ??
      stringFromScoreData(score.scoreData, "submissionStatus") ??
      stringFromScoreData(score.scoreData, "reviewStatus")
  );

  if (fromString) {
    return fromString;
  }

  const adminConfirmed = booleanFromScoreData(score.scoreData, "adminConfirmed");
  if (adminConfirmed === true) {
    return "ADMIN_CONFIRMED";
  }

  return hasScore ? "DRAFT" : "NOT_STARTED";
}

export function resolvePlayerMemo(score: ScoreLike): string | null {
  return score.playerMemo ?? stringFromScoreData(score.scoreData, "playerMemo");
}

export function resolveAdminMemo(score: ScoreLike): string | null {
  return score.adminMemo ?? stringFromScoreData(score.scoreData, "adminMemo");
}

export function resolveRejectionReason(score: ScoreLike): string | null {
  return score.rejectionReason ?? stringFromScoreData(score.scoreData, "rejectionReason");
}

export function resolveSubmittedAt(score: ScoreLike): Date | null {
  return score.submittedAt ?? dateFromScoreData(score.scoreData, "submittedAt");
}

export function resolveAdminConfirmedAt(score: ScoreLike): Date | null {
  return score.adminConfirmedAt ?? dateFromScoreData(score.scoreData, "adminConfirmedAt");
}

export function resolveRejectedAt(score: ScoreLike): Date | null {
  return score.rejectedAt ?? dateFromScoreData(score.scoreData, "rejectedAt");
}

export const SCORE_STATUS_COLUMN_VALUES = [
  "DRAFT",
  "SUBMITTED",
  "ADMIN_CONFIRMED",
  "ADMIN_REJECTED"
] satisfies ScoreStatus[];

export function toScoreStatusColumn(status: MyScoreStatus | null | undefined): ScoreStatus | null {
  if (!status || status === "NOT_STARTED") {
    return null;
  }
  return status;
}
