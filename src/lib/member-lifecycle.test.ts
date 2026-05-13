import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  anonymizedPlayerName,
  buildMaskedWithdrawnUserData,
  canMemberRequestWithdrawal,
  convertMemberToPlayer,
  finalizeWithdrawnMember,
  recoverPendingWithdrawal,
  requestMemberWithdrawal,
  setMemberOperationalStatus
} from "@/lib/member-lifecycle";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    sport: {
      upsert: vi.fn()
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    player: {
      upsert: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

const sportUpsert = vi.mocked(prisma.sport.upsert);
const userFindUnique = vi.mocked(prisma.user.findUnique);
const userUpdate = vi.mocked(prisma.user.update);
const playerUpsert = vi.mocked(prisma.player.upsert);
const transaction = vi.mocked(prisma.$transaction);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("member lifecycle helpers", () => {
  it("allows withdrawal only for active members", () => {
    expect(canMemberRequestWithdrawal("ACTIVE")).toBe(true);
    expect(canMemberRequestWithdrawal("DORMANT")).toBe(false);
    expect(canMemberRequestWithdrawal("WITHDRAWN_PENDING")).toBe(false);
    expect(canMemberRequestWithdrawal("WITHDRAWN_DELETED")).toBe(false);
  });

  it("builds stable anonymous player names from a player id", () => {
    expect(anonymizedPlayerName("12345678-aaaa-bbbb-cccc-999999999999")).toBe("player_99999999");
  });

  it("masks personal user fields without changing lifecycle fields", () => {
    const withdrawnAt = new Date("2026-05-13T00:00:00.000Z");
    const data = buildMaskedWithdrawnUserData("user-123", withdrawnAt);

    expect(data.name).toBe("withdrawn_user_123");
    expect(data.phone).toBe("withdrawn-user-123");
    expect(data.email).toBe("withdrawn-user-123@withdrawn.local");
    expect(data.username).toBe("withdrawn_user_123");
    expect(data.address).toBeNull();
    expect(data.status).toBe("WITHDRAWN_DELETED");
    expect(data.withdrawnAt).toEqual(withdrawnAt);
  });
});

describe("member lifecycle writes", () => {
  it("converts an active member to a GOLF player", async () => {
    const birthDate = new Date("2008-01-01T00:00:00.000Z");

    userFindUnique.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Kim Player",
      birthDate,
      status: "ACTIVE"
    } as never);
    sportUpsert.mockResolvedValue({ id: "sport-golf" } as never);
    userUpdate.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" } as never);
    playerUpsert.mockResolvedValue({ id: "player-1" } as never);

    await convertMemberToPlayer("11111111-1111-4111-8111-111111111111", "KHU");

    expect(userFindUnique).toHaveBeenCalledWith({
      where: { id: "11111111-1111-4111-8111-111111111111" },
      select: { id: true, name: true, birthDate: true, status: true }
    });
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "11111111-1111-4111-8111-111111111111" },
      data: { userType: "PLAYER" }
    });
    expect(playerUpsert).toHaveBeenCalledWith({
      where: {
        sportId_userId: {
          sportId: "sport-golf",
          userId: "11111111-1111-4111-8111-111111111111"
        }
      },
      update: {
        name: "Kim Player",
        birthYear: 2008,
        affiliation: "KHU",
        anonymized: false
      },
      create: {
        sportId: "sport-golf",
        userId: "11111111-1111-4111-8111-111111111111",
        name: "Kim Player",
        birthYear: 2008,
        affiliation: "KHU"
      }
    });
  });

  it("requests withdrawal only for active members", async () => {
    const withdrawnAt = new Date("2026-05-13T01:00:00.000Z");

    userFindUnique.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      status: "ACTIVE"
    } as never);
    userUpdate.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" } as never);

    await requestMemberWithdrawal("11111111-1111-4111-8111-111111111111", withdrawnAt);

    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "11111111-1111-4111-8111-111111111111" },
      data: {
        status: "WITHDRAWN_PENDING",
        withdrawnAt
      }
    });
  });

  it("rejects withdrawal requests for non-active members", async () => {
    userFindUnique.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      status: "WITHDRAWN_PENDING"
    } as never);

    await expect(requestMemberWithdrawal("11111111-1111-4111-8111-111111111111")).rejects.toThrow(
      "탈퇴 신청은 ACTIVE 회원만 가능합니다."
    );
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("recovers a pending withdrawal", async () => {
    userFindUnique.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      status: "WITHDRAWN_PENDING"
    } as never);
    userUpdate.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" } as never);

    await recoverPendingWithdrawal("11111111-1111-4111-8111-111111111111");

    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "11111111-1111-4111-8111-111111111111" },
      data: {
        status: "ACTIVE",
        withdrawnAt: null
      }
    });
  });

  it("sets dormant status with dormantAt and clears withdrawal state", async () => {
    const now = new Date("2026-05-13T03:00:00.000Z");
    userUpdate.mockResolvedValue({ id: "11111111-1111-4111-8111-111111111111" } as never);

    await setMemberOperationalStatus("11111111-1111-4111-8111-111111111111", "DORMANT", now);

    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "11111111-1111-4111-8111-111111111111" },
      data: {
        status: "DORMANT",
        dormantAt: now,
        withdrawnAt: null
      }
    });
  });

  it("does not directly set withdrawn deleted without finalization", async () => {
    await expect(
      setMemberOperationalStatus("11111111-1111-4111-8111-111111111111", "WITHDRAWN_DELETED")
    ).rejects.toThrow("탈퇴 확정은 별도 확정 액션으로만 처리할 수 있습니다.");
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("finalizes withdrawal by masking the user and anonymizing linked players", async () => {
    const now = new Date("2026-05-13T02:00:00.000Z");
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: "11111111-1111-4111-8111-111111111111",
          status: "WITHDRAWN_PENDING",
          withdrawnAt: null,
          players: [
            { id: "aaaaaaaa-aaaa-4aaa-8aaa-000000000001" },
            { id: "bbbbbbbb-bbbb-4bbb-8bbb-000000000002" }
          ]
        }),
        update: vi.fn()
      },
      player: {
        update: vi.fn()
      }
    };

    transaction.mockImplementation(async (callback) => callback(tx as never) as never);

    await finalizeWithdrawnMember("11111111-1111-4111-8111-111111111111", now);

    expect(tx.player.update).toHaveBeenCalledWith({
      where: { id: "aaaaaaaa-aaaa-4aaa-8aaa-000000000001" },
      data: {
        userId: null,
        anonymized: true,
        name: "player_00000001"
      }
    });
    expect(tx.player.update).toHaveBeenCalledWith({
      where: { id: "bbbbbbbb-bbbb-4bbb-8bbb-000000000002" },
      data: {
        userId: null,
        anonymized: true,
        name: "player_00000002"
      }
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "11111111-1111-4111-8111-111111111111" },
      data: buildMaskedWithdrawnUserData("11111111-1111-4111-8111-111111111111", now)
    });
  });
});
