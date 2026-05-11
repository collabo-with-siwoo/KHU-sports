import ExcelJS from "exceljs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildTournamentScoreExport } from "@/lib/admin/score-exports";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    tournament: {
      findFirst: vi.fn()
    }
  }
}));

const tournamentFindFirst = vi.mocked(prisma.tournament.findFirst);
const now = new Date("2026-05-01T00:00:00.000Z");

function score(status: string, playerId = "p1") {
  return {
    playerId,
    round: 1,
    rank: 1,
    scoreData: {
      front9: 35,
      back9: 36,
      total: 71,
      category: "고등부",
      groupNo: "A",
      teeTime: "08:00",
      status,
      adminConfirmed: status === "ADMIN_CONFIRMED",
      playerMemo: "선수 메모",
      adminMemo: "관리자 메모"
    },
    createdAt: now,
    updatedAt: now,
    player: {
      id: playerId,
      name: status === "ADMIN_CONFIRMED" ? "김확정" : "박비공개",
      affiliation: "경희고",
      user: {
        gender: "MALE",
        phone: "010-1111-2222",
        email: "private@example.com",
        birthDate: new Date("2008-01-01T00:00:00.000Z")
      }
    }
  };
}

async function workbookCells(body: Uint8Array) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(body as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  const worksheet = workbook.worksheets[0];
  const cells: string[] = [];

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cells.push(String(cell.value ?? ""));
    });
  });

  return cells;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Admin score exports", () => {
  it("exports public leaderboard without private fields and with confirmed rows only", async () => {
    tournamentFindFirst.mockResolvedValue({
      scores: [score("ADMIN_CONFIRMED", "p1"), score("SUBMITTED", "p2")]
    } as never);

    const exported = await buildTournamentScoreExport("t1", "leaderboard");
    const cells = await workbookCells(exported!.body);

    expect(exported?.filename).toBe("leaderboard-t1.xlsx");
    expect(exported?.rowCount).toBe(1);
    expect(cells.join("|")).toContain("김확정");
    expect(cells.join("|")).not.toContain("박비공개");
    expect(cells.join("|")).not.toContain("private@example.com");
    expect(cells.join("|")).not.toContain("010-1111-2222");
    expect(cells.join("|")).not.toContain("관리자 메모");
    expect(tournamentFindFirst.mock.calls[0][0]).toMatchObject({
      select: {
        scores: {
          select: {
            player: {
              select: {
                user: {
                  select: { gender: true }
                }
              }
            }
          }
        }
      }
    });
  });

  it("exports admin score status with memo fields but without contact PII", async () => {
    tournamentFindFirst.mockResolvedValue({
      scores: [score("SUBMITTED", "p1")]
    } as never);

    const exported = await buildTournamentScoreExport("t1", "admin-scores");
    const cells = await workbookCells(exported!.body);
    const text = cells.join("|");

    expect(exported?.filename).toBe("admin-scores-t1.xlsx");
    expect(text).toContain("관리자 메모");
    expect(text).toContain("선수 메모");
    expect(text).not.toContain("private@example.com");
    expect(text).not.toContain("010-1111-2222");
  });

  it("exports private operations workbook with contact PII", async () => {
    tournamentFindFirst.mockResolvedValue({
      scores: [score("ADMIN_CONFIRMED", "p1")]
    } as never);

    const exported = await buildTournamentScoreExport("t1", "private");
    const cells = await workbookCells(exported!.body);
    const text = cells.join("|");

    expect(exported?.filename).toBe("private-operations-t1.xlsx");
    expect(text).toContain("private@example.com");
    expect(text).toContain("010-1111-2222");
    expect(text).toContain("2008-01-01");
  });
});
