import type { Prisma, UserStatus, UserType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const USER_TYPES = new Set<UserType>(["GENERAL", "PLAYER"]);
const USER_STATUSES = new Set<UserStatus>(["ACTIVE", "DORMANT", "WITHDRAWN_PENDING", "WITHDRAWN_DELETED"]);
const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 30;

export type MemberListFilters = {
  page: number;
  pageSize: number;
  query?: string;
  userType?: UserType;
  status?: UserStatus;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseMemberListSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): MemberListFilters {
  const page = positiveInt(firstParam(searchParams.page), 1);
  const pageSize = Math.min(positiveInt(firstParam(searchParams.pageSize), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const query = firstParam(searchParams.q)?.trim();
  const userType = firstParam(searchParams.userType);
  const status = firstParam(searchParams.status);

  return {
    page,
    pageSize,
    ...(query ? { query } : {}),
    ...(userType && USER_TYPES.has(userType as UserType) ? { userType: userType as UserType } : {}),
    ...(status && USER_STATUSES.has(status as UserStatus) ? { status: status as UserStatus } : {})
  };
}

function memberWhere(filters: MemberListFilters): Prisma.UserWhereInput {
  return {
    ...(filters.userType ? { userType: filters.userType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.query
      ? {
          OR: [
            { name: { contains: filters.query, mode: "insensitive" } },
            { username: { contains: filters.query, mode: "insensitive" } },
            { email: { contains: filters.query, mode: "insensitive" } },
            { phone: { contains: filters.query, mode: "insensitive" } }
          ]
        }
      : {})
  };
}

export async function listAdminMembers(filters: MemberListFilters) {
  const where = memberWhere(filters);
  const [total, members] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      orderBy: [{ status: "asc" }, { userType: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        userType: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        withdrawnAt: true,
        players: {
          where: {
            sport: { code: "GOLF" }
          },
          select: {
            id: true,
            affiliation: true,
            anonymized: true,
            _count: {
              select: { scores: true }
            }
          }
        }
      }
    })
  ]);

  return {
    members,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    pageCount: Math.max(1, Math.ceil(total / filters.pageSize))
  };
}

export async function getAdminMemberDetail(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phone: true,
      birthDate: true,
      gender: true,
      address: true,
      userType: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
      withdrawnAt: true,
      players: {
        where: {
          sport: { code: "GOLF" }
        },
        select: {
          id: true,
          name: true,
          birthYear: true,
          affiliation: true,
          anonymized: true,
          _count: {
            select: { scores: true }
          },
          scores: {
            take: 10,
            orderBy: { updatedAt: "desc" },
            select: {
              id: true,
              round: true,
              rank: true,
              scoreData: true,
              updatedAt: true,
              tournament: {
                select: {
                  id: true,
                  name: true,
                  startDate: true,
                  endDate: true
                }
              }
            }
          }
        }
      }
    }
  });
}
