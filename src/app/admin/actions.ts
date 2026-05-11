"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { APP_SESSION_COOKIE_NAME, getAppSessionCookieOptions } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const adminLoginSchema = z.object({
  email: z.string().trim().email("관리자 이메일을 확인해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  next: z.string().default("/admin")
});

function safeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

export async function adminSignInAction(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const parsed = adminLoginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? "/admin")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "관리자 로그인 정보를 확인해주세요."
    };
  }

  const email = parsed.data.email.toLowerCase();
  const nextPath = safeNextPath(parsed.data.next);
  let supabase;

  try {
    supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.data.password
    });

    if (error) {
      return {
        status: "error",
        message: "관리자 이메일 또는 비밀번호를 확인해주세요."
      };
    }
  } catch {
    return {
      status: "error",
      message: "관리자 인증 환경 설정을 확인해주세요."
    };
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
      select: { status: true }
    });

    if (!admin || admin.status !== "ACTIVE") {
      await supabase.auth.signOut();

      return {
        status: "error",
        message: "활성화된 관리자 계정이 아닙니다."
      };
    }
  } catch {
    await supabase.auth.signOut();

    return {
      status: "error",
      message: "관리자 권한 저장소에 연결할 수 없습니다."
    };
  }

  redirect(nextPath);
}

export async function adminSignOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.set(APP_SESSION_COOKIE_NAME, "", {
    ...getAppSessionCookieOptions(),
    maxAge: 0
  });
  redirect("/admin");
}

