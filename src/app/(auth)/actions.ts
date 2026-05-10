"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureDefaultAgreements, getRequiredAgreementVersionIdsFrom } from "@/lib/agreement-service";
import { createSignupSchema, loginSchema, resetPasswordSchema } from "@/lib/auth/schemas";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function firstIssueMessage(errorMessage: string | undefined, fallback: string) {
  return errorMessage ?? fallback;
}

function getFormStrings(formData: FormData) {
  return {
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    name: String(formData.get("name") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    agreementVersionIds: formData
      .getAll("agreementVersionIds")
      .filter((value): value is string => typeof value === "string"),
    ageConfirmed: String(formData.get("ageConfirmed") ?? "")
  };
}

async function getRequestIp() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");

  return forwardedFor?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? "")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: firstIssueMessage(parsed.error.issues[0]?.message, "로그인 정보를 확인해주세요.")
    };
  }

  const user = await prisma.user.findUnique({
    where: { username: parsed.data.username },
    select: { id: true, email: true, status: true }
  });

  if (!user || user.status !== "ACTIVE") {
    return {
      status: "error",
      message: "아이디 또는 비밀번호를 확인해주세요."
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.password
  });

  if (error) {
    return {
      status: "error",
      message: "아이디 또는 비밀번호를 확인해주세요."
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  redirect("/mypage");
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  let activeAgreements;

  try {
    activeAgreements = await ensureDefaultAgreements();
  } catch {
    return {
      status: "error",
      message: "회원가입 저장소 준비가 필요합니다. Supabase DB 스키마를 먼저 적용해주세요."
    };
  }

  const signupSchema = createSignupSchema(getRequiredAgreementVersionIdsFrom(activeAgreements));
  const parsed = signupSchema.safeParse(getFormStrings(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: firstIssueMessage(parsed.error.issues[0]?.message, "회원가입 정보를 확인해주세요.")
    };
  }

  const email = parsed.data.email.toLowerCase();
  const username = parsed.data.username.toLowerCase();

  const duplicate = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }]
    },
    select: { id: true }
  });

  if (duplicate) {
    return {
      status: "error",
      message: "이미 사용 중인 아이디 또는 이메일입니다."
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: {
        username,
        name: parsed.data.name,
        userType: "GENERAL"
      },
      emailRedirectTo: `${getSiteUrl().replace(/\/$/, "")}/login`
    }
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: "회원가입을 완료할 수 없습니다. 아이디와 이메일을 다시 확인해주세요."
    };
  }

  const authUser = data.user;

  try {
    const ipAddress = await getRequestIp();

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: authUser.id,
          username,
          email,
          name: parsed.data.name,
          phone: parsed.data.phone,
          birthDate: new Date(`${parsed.data.birthDate}T00:00:00.000Z`),
          gender: parsed.data.gender,
          address: parsed.data.address,
          userType: "GENERAL",
          status: "ACTIVE"
        }
      });

      await tx.userAgreement.createMany({
        data: parsed.data.agreementVersionIds.map((agreementVersionId) => ({
          userId: authUser.id,
          agreementVersionId,
          ipAddress
        }))
      });
    });
  } catch {
    await createSupabaseAdminClient().auth.admin.deleteUser(authUser.id);

    return {
      status: "error",
      message: "회원 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요."
    };
  }

  redirect("/login?signup=success");
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: String(formData.get("email") ?? "")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: firstIssueMessage(parsed.error.issues[0]?.message, "이메일을 확인해주세요.")
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase(), {
    redirectTo: `${getSiteUrl().replace(/\/$/, "")}/reset-password`
  });

  if (error) {
    return {
      status: "error",
      message: "재설정 메일을 발송하지 못했습니다. 잠시 후 다시 시도해주세요."
    };
  }

  return {
    status: "success",
    message: "가입된 이메일이라면 비밀번호 재설정 링크가 발송됩니다."
  };
}
