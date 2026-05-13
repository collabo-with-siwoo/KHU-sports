import type { Prisma, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function shortSuffix(id: string) {
  const lastSegment = id.split("-").filter(Boolean).at(-1) ?? id;

  return lastSegment.replace(/[^a-zA-Z0-9]/g, "").slice(-8) || "anonymous";
}

export function canMemberRequestWithdrawal(status: UserStatus) {
  return status === "ACTIVE";
}

export function anonymizedPlayerName(playerId: string) {
  return `player_${shortSuffix(playerId)}`;
}

export function buildMaskedWithdrawnUserData(userId: string, withdrawnAt: Date): Prisma.UserUpdateInput {
  const suffix = shortSuffix(userId);

  return {
    username: `withdrawn_user_${suffix}`,
    email: `withdrawn-user-${suffix}@withdrawn.local`,
    name: `withdrawn_user_${suffix}`,
    phone: `withdrawn-user-${suffix}`,
    address: null,
    userType: "GENERAL",
    status: "WITHDRAWN_DELETED",
    withdrawnAt
  };
}

function assertUserFound<T>(user: T | null) {
  if (!user) {
    throw new Error("회원을 찾을 수 없습니다.");
  }

  return user;
}

function assertNotWithdrawn(status: UserStatus) {
  if (status === "WITHDRAWN_PENDING" || status === "WITHDRAWN_DELETED") {
    throw new Error("탈퇴 처리 중인 회원은 선수로 전환할 수 없습니다.");
  }
}

export async function convertMemberToPlayer(userId: string, affiliation?: string | null) {
  const user = assertUserFound(
    await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, birthDate: true, status: true }
    })
  );

  assertNotWithdrawn(user.status);

  const sport = await prisma.sport.upsert({
    where: { code: "GOLF" },
    update: { active: true },
    create: { code: "GOLF", name: "골프", active: true }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { userType: "PLAYER" }
  });

  return prisma.player.upsert({
    where: {
      sportId_userId: {
        sportId: sport.id,
        userId: user.id
      }
    },
    update: {
      name: user.name,
      birthYear: user.birthDate.getUTCFullYear(),
      affiliation: affiliation || null,
      anonymized: false
    },
    create: {
      sportId: sport.id,
      userId: user.id,
      name: user.name,
      birthYear: user.birthDate.getUTCFullYear(),
      affiliation: affiliation || null
    }
  });
}

export async function demoteMemberToGeneral(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { userType: "GENERAL" }
  });
}

export async function requestMemberWithdrawal(userId: string, withdrawnAt = new Date()) {
  const user = assertUserFound(
    await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true }
    })
  );

  if (!canMemberRequestWithdrawal(user.status)) {
    throw new Error("탈퇴 신청은 ACTIVE 회원만 가능합니다.");
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      status: "WITHDRAWN_PENDING",
      withdrawnAt
    }
  });
}

export async function recoverPendingWithdrawal(userId: string) {
  const user = assertUserFound(
    await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true }
    })
  );

  if (user.status !== "WITHDRAWN_PENDING") {
    throw new Error("복구는 탈퇴 유예 상태의 회원만 가능합니다.");
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      status: "ACTIVE",
      withdrawnAt: null
    }
  });
}

export async function setMemberOperationalStatus(userId: string, status: UserStatus, now = new Date()) {
  if (status === "WITHDRAWN_DELETED") {
    throw new Error("탈퇴 확정은 별도 확정 액션으로만 처리할 수 있습니다.");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      status,
      ...(status === "ACTIVE" ? { dormantAt: null, withdrawnAt: null } : {}),
      ...(status === "DORMANT" ? { dormantAt: now, withdrawnAt: null } : {}),
      ...(status === "WITHDRAWN_PENDING" ? { withdrawnAt: now } : {})
    }
  });
}

export async function finalizeWithdrawnMember(userId: string, now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const user = assertUserFound(
      await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          status: true,
          withdrawnAt: true,
          players: {
            select: { id: true }
          }
        }
      })
    );

    if (user.status !== "WITHDRAWN_PENDING") {
      throw new Error("탈퇴 확정은 탈퇴 유예 상태의 회원만 가능합니다.");
    }

    await Promise.all(
      user.players.map((player) =>
        tx.player.update({
          where: { id: player.id },
          data: {
            userId: null,
            anonymized: true,
            name: anonymizedPlayerName(player.id)
          }
        })
      )
    );

    return tx.user.update({
      where: { id: user.id },
      data: buildMaskedWithdrawnUserData(user.id, user.withdrawnAt ?? now)
    });
  });
}
