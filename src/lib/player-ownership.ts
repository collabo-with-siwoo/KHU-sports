import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type OwnedScoreInputPlayer = {
  id: string;
  scores: Array<{
    id: string;
    scoreData: Prisma.JsonValue;
  }>;
};

export async function findOwnedGolfPlayerForScoreInput({
  userId,
  sportId,
  tournamentId,
  round
}: {
  userId: string;
  sportId: string;
  tournamentId: string;
  round: number;
}): Promise<OwnedScoreInputPlayer | null> {
  return prisma.player.findFirst({
    where: {
      sportId,
      userId
    },
    select: {
      id: true,
      scores: {
        where: {
          tournamentId,
          round
        },
        select: {
          id: true,
          scoreData: true
        },
        take: 1
      }
    }
  });
}
