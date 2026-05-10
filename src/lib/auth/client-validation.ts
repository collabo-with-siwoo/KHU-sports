import { loginSchema, resetPasswordSchema, signupSchema } from "@/lib/auth/schemas";

export type ClientValidationResult = {
  status: "idle" | "success" | "error";
  message: string;
};

const successMessage =
  "입력값 검증은 통과했습니다. Supabase 프로젝트 연결 후 실제 처리됩니다.";

export function validateLoginForm(formData: FormData): ClientValidationResult {
  const parsed = loginSchema.safeParse({
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? "")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "로그인 정보를 확인해주세요."
    };
  }

  return {
    status: "success",
    message: successMessage
  };
}

export function validateSignupForm(formData: FormData): ClientValidationResult {
  const parsed = signupSchema.safeParse({
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
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "회원가입 정보를 확인해주세요."
    };
  }

  return {
    status: "success",
    message: successMessage
  };
}

export function validateResetPasswordForm(formData: FormData): ClientValidationResult {
  const parsed = resetPasswordSchema.safeParse({
    email: String(formData.get("email") ?? "")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "이메일을 확인해주세요."
    };
  }

  return {
    status: "success",
    message: successMessage
  };
}
