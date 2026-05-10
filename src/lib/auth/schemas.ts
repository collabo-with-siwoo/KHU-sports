import { z } from "zod";
import { getRequiredAgreementVersionIds } from "@/lib/agreements";

const usernameRegex = /^[A-Za-z0-9]{4,20}$/;
const koreanNameRegex = /^[가-힣]{2,10}$/;
const phoneRegex = /^010-\d{4}-\d{4}$/;
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/;

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(usernameRegex, "아이디는 영문과 숫자 4~20자로 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요.")
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("이메일 형식을 확인해주세요.")
});

export const signupSchema = z
  .object({
    username: z
      .string()
      .trim()
      .regex(usernameRegex, "아이디는 영문과 숫자 4~20자로 입력해주세요."),
    password: z
      .string()
      .regex(
        passwordRegex,
        "비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다."
      ),
    confirmPassword: z.string(),
    name: z
      .string()
      .trim()
      .regex(koreanNameRegex, "이름은 한글 2~10자로 입력해주세요."),
    birthDate: z.string().refine((value) => {
      const date = new Date(`${value}T00:00:00+09:00`);
      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const today = new Date();
      const age =
        today.getFullYear() -
        date.getFullYear() -
        (today.getMonth() < date.getMonth() ||
        (today.getMonth() === date.getMonth() &&
          today.getDate() < date.getDate())
          ? 1
          : 0);

      return age >= 14;
    }, "만 14세 이상만 가입할 수 있습니다."),
    gender: z.enum(["MALE", "FEMALE"], {
      message: "성별을 선택해주세요."
    }),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "전화번호는 010-XXXX-XXXX 형식으로 입력해주세요."),
    email: z.string().trim().email("이메일 형식을 확인해주세요."),
    address: z.string().trim().min(1, "주소를 입력해주세요."),
    agreementVersionIds: z.array(z.string()).default([]),
    ageConfirmed: z.literal("on", {
      message: "만 14세 이상 확인에 동의해주세요."
    })
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "비밀번호 확인이 일치하지 않습니다.",
        path: ["confirmPassword"]
      });
    }

    for (const requiredVersionId of getRequiredAgreementVersionIds()) {
      if (!value.agreementVersionIds.includes(requiredVersionId)) {
        context.addIssue({
          code: "custom",
          message: "필수 약관에 모두 동의해주세요.",
          path: ["agreementVersionIds"]
        });
        break;
      }
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
