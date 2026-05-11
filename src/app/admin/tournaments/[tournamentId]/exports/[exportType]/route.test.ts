import { beforeEach, describe, expect, it, vi } from "vitest";
import { canAccessAdmin, getCurrentAdmin } from "@/lib/admin/auth";
import { buildTournamentScoreExport } from "@/lib/admin/score-exports";
import { prisma } from "@/lib/prisma";
import { GET } from "./route";

vi.mock("@/lib/admin/auth", () => ({
  canAccessAdmin: vi.fn(),
  getCurrentAdmin: vi.fn()
}));

vi.mock("@/lib/admin/score-exports", () => ({
  buildTournamentScoreExport: vi.fn(),
  isScoreExportType: (value: string) => ["leaderboard", "admin-scores", "scorecards", "private"].includes(value)
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    exportLog: {
      create: vi.fn()
    }
  }
}));

const getCurrentAdminMock = vi.mocked(getCurrentAdmin);
const canAccessAdminMock = vi.mocked(canAccessAdmin);
const buildTournamentScoreExportMock = vi.mocked(buildTournamentScoreExport);
const exportLogCreate = vi.mocked(prisma.exportLog.create);

function request(path: string) {
  return new Request(`http://localhost:3000${path}`);
}

function params(exportType: string) {
  return {
    params: Promise.resolve({
      tournamentId: "11111111-1111-4111-8111-111111111111",
      exportType
    })
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin tournament export route", () => {
  it("redirects unauthenticated users to admin login", async () => {
    getCurrentAdminMock.mockResolvedValue(null);

    const response = await GET(
      request("/admin/tournaments/11111111-1111-4111-8111-111111111111/exports/leaderboard"),
      params("leaderboard")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/admin?next=");
    expect(buildTournamentScoreExportMock).not.toHaveBeenCalled();
  });

  it("forbids private export without SUPER or privacy.export", async () => {
    getCurrentAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin",
      role: "MEMBER",
      permissions: {},
      status: "ACTIVE"
    });
    canAccessAdminMock.mockReturnValue(false);

    const response = await GET(
      request("/admin/tournaments/11111111-1111-4111-8111-111111111111/exports/private?reason=ops"),
      params("private")
    );

    expect(response.status).toBe(403);
    expect(exportLogCreate).not.toHaveBeenCalled();
  });

  it("requires a reason for private export", async () => {
    getCurrentAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin",
      role: "SUPER",
      permissions: {},
      status: "ACTIVE"
    });

    const response = await GET(
      request("/admin/tournaments/11111111-1111-4111-8111-111111111111/exports/private"),
      params("private")
    );

    expect(response.status).toBe(400);
    expect(exportLogCreate).not.toHaveBeenCalled();
  });

  it("logs authorized private export", async () => {
    getCurrentAdminMock.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin",
      role: "SUPER",
      permissions: {},
      status: "ACTIVE"
    });
    buildTournamentScoreExportMock.mockResolvedValue({
      body: new Uint8Array([1, 2, 3]),
      filename: "private-operations-t1.xlsx",
      rowCount: 2
    });

    const response = await GET(
      request("/admin/tournaments/11111111-1111-4111-8111-111111111111/exports/private?reason=ops"),
      params("private")
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain("private-operations-t1.xlsx");
    expect(exportLogCreate).toHaveBeenCalledWith({
      data: {
        adminUserId: "admin-1",
        exportType: "private",
        tournamentId: "11111111-1111-4111-8111-111111111111",
        rowCount: 2,
        reason: "ops"
      }
    });
  });
});
