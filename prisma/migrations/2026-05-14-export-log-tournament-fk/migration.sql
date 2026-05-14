UPDATE "ExportLog"
SET "tournamentId" = NULL
WHERE "tournamentId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "Tournament"
    WHERE "Tournament"."id" = "ExportLog"."tournamentId"
  );

ALTER TABLE "ExportLog"
ADD CONSTRAINT "ExportLog_tournamentId_fkey"
FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
