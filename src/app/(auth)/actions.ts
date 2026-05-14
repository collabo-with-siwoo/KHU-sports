"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { ensureDefaultAgreements, getRequiredAgreementVersionIdsFrom } from "@/lib/agreement-service";
import { checkActionRateLimit, RATE_LIMIT_MESSAGE } from "@/lib/action-rate-limit";
import { createSignupSchema, loginSchema, resetPasswordSchema } from "@/lib/auth/schemas";
import { APP_SESSION_COOKIE_NAME, getAppSessionCookieOptions } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getRequestIp } from "@/lib/request-ip";
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

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function authRuntimeErrorMessage() {
  return "인증 환경 설정을 확인해주세요. Vercel의 Supabase 환경변수가 최신 값인지 점검이 필요합니다.";
}

function safeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/mypage";
  }

  return value;
}

async function startAppSession() {
  const cookieStore = await cookies();

  cookieStore.set(APP_SESSION_COOKIE_NAME, String(Date.now()), getAppSessionCookieOptions());
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const nextPath = safeNextPath(formData.get("next"));
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

  const requestIp = await getRequestIp();
  const rateLimit = checkActionRateLimit("member-login", [parsed.data.username, requestIp]);

  if (!rateLimit.allowed) {
    return {
      status: "error",
      message: RATE_LIMIT_MESSAGE
    };
  }

  let user;

  try {
    user = await prisma.user.findUnique({
      where: { username: parsed.data.username.toLowerCase() },
      select: { id: true, email: true, status: true }
    });
  } catch {
    return {
      status: "error",
      message: "회원 저장소에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
    };
  }

  if (!user || user.status !== "ACTIVE") {
    return {
      status: "error",
      message: "아이디 또는 비밀번호를 확인해주세요."
    };
  }

  let signInError;

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.password
    });
    signInError = error;
  } catch {
    return {
      status: "error",
      message: authRuntimeErrorMessage()
    };
  }

  if (signInError) {
    return {
      status: "error",
      message: "아이디 또는 비밀번호를 확인해주세요."
    };
  }

  try {
    await startAppSession();
  } catch {
    return {
      status: "error",
      message: "로그인 상태를 저장하지 못했습니다. 잠시 후 다시 시도해주세요."
    };
  }

  after(
    prisma.user
      .update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
      .catch(() => {
        // Login should not fail after Supabase Auth succeeds because analytics metadata failed to write.
      })
  );

  redirect(nextPath);
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
  const requestIp = await getRequestIp();
  const rateLimit = checkActionRateLimit("signup", [username, email, requestIp]);

  if (!rateLimit.allowed) {
    return {
      status: "error",
      message: RATE_LIMIT_MESSAGE
    };
  }

  let duplicate;

  try {
    duplicate = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      },
      select: { id: true }
    });
  } catch {
    return {
      status: "error",
      message: "회원 저장소에 연결할 수 없습니다. Vercel의 DATABASE_URL을 확인해주세요."
    };
  }

  if (duplicate) {
    return {
      status: "error",
      message: "이미 사용 중인 아이디 또는 이메일입니다."
    };
  }

  let authUserId: string | null = null;
  let signUpError = false;

  try {
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

    signUpError = Boolean(error || !data.user);
    authUserId = data.user?.id ?? null;
  } catch {
    return {
      status: "error",
      message: authRuntimeErrorMessage()
    };
  }

  if (signUpError || !authUserId) {
    return {
      status: "error",
      message: "회원가입을 완료할 수 없습니다. 아이디와 이메일을 다시 확인해주세요."
    };
  }

  try {
    const ipAddress = requestIp;

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: authUserId,
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
          userId: authUserId,
          agreementVersionId,
          ipAddress
        }))
      });
    });
  } catch {
    try {
      await createSupabaseAdminClient().auth.admin.deleteUser(authUserId);
    } catch {
      // If cleanup cannot run because the service role key is missing, still return a form error.
    }

    return {
      status: "error",
      message: "회원 정보를 저장하지 못했습니다. Vercel의 DATABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요."
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

  const email = parsed.data.email.toLowerCase();
  const requestIp = await getRequestIp();
  const rateLimit = checkActionRateLimit("password-reset", [email, requestIp]);

  if (!rateLimit.allowed) {
    return {
      status: "error",
      message: RATE_LIMIT_MESSAGE
    };
  }

  let resetError;

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl().replace(/\/$/, "")}/reset-password`
    });
    resetError = error;
  } catch {
    return {
      status: "error",
      message: authRuntimeErrorMessage()
    };
  }

  if (resetError) {
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
