-- Score normalization (additive only): see prisma/migrations/2026-05-13-score-normalization/README.md
-- Generated with `prisma migrate diff --from-schema-datamodel <pre> --to-schema-datamodel <new> --script`.
-- All new columns are NULLABLE so existing rows keep working through the column ?? scoreData fallback in src/lib/score-normalization.ts.

-- CreateEnum
CREATE TYPE "ScoreStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ADMIN_CONFIRMED', 'ADMIN_REJECTED');

-- CreateEnum
CREATE TYPE "ScoreReviewAction" AS ENUM ('SUBMIT', 'CONFIRM', 'REJECT', 'REVERT');

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "adminConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "adminMemo" TEXT,
ADD COLUMN     "playerMemo" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "ScoreStatus",
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ScoreReviewLog" (
    "id" UUID NOT NULL,
    "scoreId" UUID NOT NULL,
    "action" "ScoreReviewAction" NOT NULL,
    "byAdminId" UUID,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScoreReviewLog_scoreId_createdAt_idx" ON "ScoreReviewLog"("scoreId", "createdAt");

-- CreateIndex
CREATE INDEX "ScoreReviewLog_byAdminId_idx" ON "ScoreReviewLog"("byAdminId");

-- CreateIndex
CREATE INDEX "Score_status_idx" ON "Score"("status");

-- AddForeignKey
ALTER TABLE "ScoreReviewLog" ADD CONSTRAINT "ScoreReviewLog_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreReviewLog" ADD CONSTRAINT "ScoreReviewLog_byAdminId_fkey" FOREIGN KEY ("byAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
