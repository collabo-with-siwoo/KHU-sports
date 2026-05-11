"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  adminPermissionKeys,
  fullAdminPermissions,
  requireAdminPermission
} from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export type AdminInviteActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const adminInviteSchema = z.object({
  email: z.string().trim().email("관리자 이메일을 확인해주세요."),
  name: z.string().trim().min(2, "관리자 이름을 입력해주세요."),
  role: z.enum(["SUPER", "MEMBER"]),
  status: z.enum(["PENDING", "ACTIVE", "DISABLED"])
});

function permissionsFromForm(formData: FormData) {
  return adminPermissionKeys.reduce<Record<string, { read: boolean; write: boolean; export?: boolean }>>(
    (permissions, key) => {
      permissions[key] = {
        read: formData.get(`${key}.read`) === "on",
        write: formData.get(`${key}.write`) === "on",
        ...(key === "privacy" ? { export: formData.get(`${key}.export`) === "on" } : {})
      };
      return permissions;
    },
    {}
  );
}

export async function upsertAdminAction(
  _previousState: AdminInviteActionState,
  formData: FormData
): Promise<AdminInviteActionState> {
  const currentAdmin = await requireAdminPermission("admins", "write", "/admin/admins");
  const parsed = adminInviteSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? "MEMBER"),
    status: String(formData.get("status") ?? "PENDING")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "관리자 정보를 확인해주세요."
    };
  }

  const permissions =
    parsed.data.role === "SUPER" ? fullAdminPermissions() : permissionsFromForm(formData);

  await prisma.adminUser.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    update: {
      name: parsed.data.name,
      role: parsed.data.role,
      status: parsed.data.status,
      permissions
    },
    create: {
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      role: parsed.data.role,
      status: parsed.data.status,
      permissions,
      invitedBy: currentAdmin.id
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/admins");

  return {
    status: "success",
    message:
      parsed.data.status === "PENDING"
        ? "관리자 프로필을 대기 상태로 저장했습니다. Supabase Auth 사용자/초대 메일 연결 후 활성화하세요."
        : "관리자 권한을 저장했습니다."
  };
}
