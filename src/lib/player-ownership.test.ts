import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { findOwnedGolfPlayerForScoreInput } from "./player-ownership";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    player: {
      findFirst: vi.fn()
    }
  }
}));

const playerFindFirst = vi.mocked(prisma.player.findFirst);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("findOwnedGolfPlayerForScoreInput", () => {
  it("looks up the player by session user id and sport only", async () => {
    playerFindFirst.mockResolvedValue({ id: "player-1", scores: [] } as never);

    const result = await findOwnedGolfPlayerForScoreInput({
      userId: "session-user",
      sportId: "sport-golf",
      tournamentId: "tournament-1",
      round: 2
    });

    expect(result?.id).toBe("player-1");
    expect(playerFindFirst).toHaveBeenCalledWith({
      where: {
        sportId: "sport-golf",
        userId: "session-user"
      },
      select: {
        id: true,
        scores: {
          where: {
            tournamentId: "tournament-1",
            round: 2
          },
          select: {
            id: true,
            scoreData: true
          },
          take: 1
        }
      }
    });
  });
});
