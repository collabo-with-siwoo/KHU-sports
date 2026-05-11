import { redirect } from "next/navigation";
import type { AdminUser, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminPermissionKey = "notices" | "members" | "scores" | "tournaments" | "admins";
export type AdminPermissionAction = "read" | "write";

export type CurrentAdmin = Pick<
  AdminUser,
  "id" | "email" | "name" | "role" | "permissions" | "status"
>;

type PermissionMap = Partial<
  Record<AdminPermissionKey, Partial<Record<AdminPermissionAction, boolean>>>
>;

function parsePermissions(value: Prisma.JsonValue): PermissionMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as PermissionMap;
}

export function canAccessAdmin(
  admin: CurrentAdmin,
  key: AdminPermissionKey,
  action: AdminPermissionAction
) {
  if (admin.role === "SUPER") {
    return true;
  }

  const permissions = parsePermissions(admin.permissions);

  return Boolean(permissions[key]?.[action]);
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: user.email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      status: true
    }
  });

  if (!admin || admin.status !== "ACTIVE") {
    return null;
  }

  return admin;
}

export async function requireAdmin(redirectTo = "/admin") {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/admin?next=${encodeURIComponent(redirectTo)}`);
  }

  return admin;
}

export async function requireAdminPermission(
  key: AdminPermissionKey,
  action: AdminPermissionAction,
  redirectTo = "/admin"
) {
  const admin = await requireAdmin(redirectTo);

  if (!canAccessAdmin(admin, key, action)) {
    redirect("/admin?error=forbidden");
  }

  return admin;
}

