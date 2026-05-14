import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminPermissionKeys,
  canAccessAdmin,
  fullAdminPermissions,
  requireAdminPermission
} from "@/lib/admin/auth";
import type { CurrentAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`__REDIRECT__:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url)
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    adminUser: {
      findUnique: vi.fn()
    }
  }
}));

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient);
const adminUserFindUnique = vi.mocked(prisma.adminUser.findUnique);

function stubSupabaseWithEmail(email: string | null) {
  createSupabaseServerClientMock.mockResolvedValue({
    auth: {
      getClaims: vi.fn().mockResolvedValue({
        data: email ? { claims: { email } } : null,
        error: null
      })
    }
  } as never);
}

function superAdmin(): CurrentAdmin {
  return {
    id: "admin-super",
    email: "super@example.com",
    name: "Super",
    role: "SUPER",
    permissions: {},
    status: "ACTIVE"
  };
}

function memberAdmin(permissions: Record<string, Record<string, boolean>>): CurrentAdmin {
  return {
    id: "admin-member",
    email: "member@example.com",
    name: "Member",
    role: "MEMBER",
    permissions,
    status: "ACTIVE"
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("canAccessAdmin", () => {
  it("grants SUPER every permission regardless of permission map", () => {
    expect(canAccessAdmin(superAdmin(), "members", "write")).toBe(true);
    expect(canAccessAdmin(superAdmin(), "privacy", "export")).toBe(true);
  });

  it("grants SUPER every known key/action combination", () => {
    const admin = superAdmin();

    for (const key of adminPermissionKeys) {
      expect(canAccessAdmin(admin, key, "read")).toBe(true);
      expect(canAccessAdmin(admin, key, "write")).toBe(true);
      expect(canAccessAdmin(admin, key, "export")).toBe(true);
    }
  });

  it("fullAdminPermissions grants every known key/action combination", () => {
    const admin = memberAdmin(fullAdminPermissions());

    for (const key of adminPermissionKeys) {
      expect(canAccessAdmin(admin, key, "read")).toBe(true);
      expect(canAccessAdmin(admin, key, "write")).toBe(true);
      expect(canAccessAdmin(admin, key, "export")).toBe(true);
    }
  });

  it("grants MEMBER only the actions explicitly listed", () => {
    const admin = memberAdmin({ members: { read: true } });

    expect(canAccessAdmin(admin, "members", "read")).toBe(true);
    expect(canAccessAdmin(admin, "members", "write")).toBe(false);
    expect(canAccessAdmin(admin, "scores", "read")).toBe(false);
  });

  it("denies MEMBER when no permission map entries match", () => {
    const admin = memberAdmin({});
    expect(canAccessAdmin(admin, "members", "read")).toBe(false);
  });

  it("requires explicit privacy.export for MEMBER private exports", () => {
    expect(canAccessAdmin(memberAdmin({ privacy: { read: true } }), "privacy", "export")).toBe(
      false
    );
    expect(canAccessAdmin(memberAdmin({ privacy: { export: true } }), "privacy", "export")).toBe(
      true
    );
  });
});

describe("requireAdminPermission", () => {
  it("redirects to /admin?next=... when there is no Supabase session", async () => {
    stubSupabaseWithEmail(null);

    await expect(requireAdminPermission("members", "read", "/admin/members")).rejects.toThrow(
      "__REDIRECT__:/admin?next=%2Fadmin%2Fmembers"
    );
    expect(adminUserFindUnique).not.toHaveBeenCalled();
  });

  it("redirects to /admin?next=... when Supabase user is not in AdminUser", async () => {
    stubSupabaseWithEmail("ghost@example.com");
    adminUserFindUnique.mockResolvedValue(null);

    await expect(requireAdminPermission("members", "read", "/admin/members")).rejects.toThrow(
      "__REDIRECT__:/admin?next=%2Fadmin%2Fmembers"
    );
  });

  it("redirects to /admin?error=forbidden when MEMBER lacks the action", async () => {
    stubSupabaseWithEmail("member@example.com");
    adminUserFindUnique.mockResolvedValue(memberAdmin({ members: { read: true } }) as never);

    await expect(
      requireAdminPermission("members", "write", "/admin/members")
    ).rejects.toThrow("__REDIRECT__:/admin?error=forbidden");
  });

  it("returns the admin when MEMBER permission matches", async () => {
    const admin = memberAdmin({ members: { read: true, write: true } });
    stubSupabaseWithEmail("member@example.com");
    adminUserFindUnique.mockResolvedValue(admin as never);

    await expect(requireAdminPermission("members", "write")).resolves.toMatchObject({
      id: admin.id,
      role: "MEMBER"
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns SUPER admin without consulting the permission map", async () => {
    stubSupabaseWithEmail("super@example.com");
    adminUserFindUnique.mockResolvedValue(superAdmin() as never);

    await expect(requireAdminPermission("privacy", "export")).resolves.toMatchObject({
      role: "SUPER"
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("denies a non-ACTIVE admin even with matching permissions", async () => {
    stubSupabaseWithEmail("dormant@example.com");
    adminUserFindUnique.mockResolvedValue({
      ...memberAdmin({ members: { read: true } }),
      status: "DORMANT"
    } as never);

    await expect(requireAdminPermission("members", "read", "/admin/members")).rejects.toThrow(
      "__REDIRECT__:/admin?next=%2Fadmin%2Fmembers"
    );
  });
});
