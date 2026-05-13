import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getAdminMemberDetail,
  listAdminMembers,
  parseMemberListSearchParams
} from "@/lib/admin/members";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn()
    }
  }
}));

const userCount = vi.mocked(prisma.user.count);
const userFindMany = vi.mocked(prisma.user.findMany);
const userFindUnique = vi.mocked(prisma.user.findUnique);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin member search params", () => {
  it("normalizes pagination and ignores invalid filters", () => {
    const filters = parseMemberListSearchParams({
      q: "  kim  ",
      page: "-4",
      pageSize: "999",
      userType: "ADMIN",
      status: "UNKNOWN"
    });

    expect(filters).toEqual({
      page: 1,
      pageSize: 30,
      query: "kim"
    });
  });

  it("keeps valid user type and status filters", () => {
    const filters = parseMemberListSearchParams({
      page: "3",
      userType: "PLAYER",
      status: "WITHDRAWN_PENDING"
    });

    expect(filters).toEqual({
      page: 3,
      pageSize: 30,
      userType: "PLAYER",
      status: "WITHDRAWN_PENDING"
    });
  });
});

describe("admin member read model", () => {
  it("lists members with bounded select queries", async () => {
    userCount.mockResolvedValue(31);
    userFindMany.mockResolvedValue([
      {
        id: "11111111-1111-4111-8111-111111111111",
        username: "kim01",
        email: "kim@example.com",
        name: "Kim",
        phone: "010-1111-2222",
        userType: "PLAYER",
        status: "ACTIVE",
        createdAt: new Date("2026-05-01T00:00:00.000Z"),
        lastLoginAt: null,
        withdrawnAt: null,
        players: [
          {
            id: "player-1",
            affiliation: "KHU",
            anonymized: false,
            _count: { scores: 2 }
          }
        ]
      }
    ] as never);

    const result = await listAdminMembers({
      page: 2,
      pageSize: 30,
      query: "kim",
      userType: "PLAYER",
      status: "ACTIVE"
    });

    const args = userFindMany.mock.calls[0][0] as Record<string, unknown>;

    expect(result.total).toBe(31);
    expect(result.pageCount).toBe(2);
    expect(args.skip).toBe(30);
    expect(args.take).toBe(30);
    expect(args).not.toHaveProperty("include");
    expect(args.select).toMatchObject({
      id: true,
      username: true,
      email: true,
      name: true,
      phone: true,
      userType: true,
      status: true,
      players: {
        select: {
          _count: {
            select: { scores: true }
          }
        }
      }
    });
    expect(args.where).toMatchObject({
      userType: "PLAYER",
      status: "ACTIVE"
    });
  });

  it("loads a member detail with recent scores capped to ten rows", async () => {
    userFindUnique.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      username: "kim01",
      email: "kim@example.com",
      name: "Kim",
      phone: "010-1111-2222",
      birthDate: new Date("2008-01-01T00:00:00.000Z"),
      gender: "MALE",
      address: "Seoul",
      userType: "PLAYER",
      status: "ACTIVE",
      createdAt: new Date("2026-05-01T00:00:00.000Z"),
      lastLoginAt: null,
      withdrawnAt: null,
      players: []
    } as never);

    await getAdminMemberDetail("11111111-1111-4111-8111-111111111111");

    const args = userFindUnique.mock.calls[0][0] as Record<string, unknown>;

    expect(args).not.toHaveProperty("include");
    expect(args.select).toMatchObject({
      players: {
        select: {
          scores: {
            take: 10,
            orderBy: { updatedAt: "desc" }
          }
        }
      }
    });
  });
});
