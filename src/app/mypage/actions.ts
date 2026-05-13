"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_SESSION_COOKIE_NAME, getAppSessionCookieOptions } from "@/lib/auth/session";
import { getCurrentMember } from "@/lib/members";
import { requestMemberWithdrawal } from "@/lib/member-lifecycle";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requestWithdrawalAction(formData: FormData) {
  const confirmText = String(formData.get("confirmText") ?? "").trim();

  if (confirmText !== "탈퇴 신청") {
    throw new Error("탈퇴 신청 문구를 정확히 입력해주세요.");
  }

  const member = await getCurrentMember();

  if (!member) {
    redirect("/login?next=%2Fmypage");
  }

  if (member.status !== "ACTIVE") {
    throw new Error("ACTIVE 상태의 회원만 탈퇴를 신청할 수 있습니다.");
  }

  await requestMemberWithdrawal(member.id);

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.set(APP_SESSION_COOKIE_NAME, "", {
    ...getAppSessionCookieOptions(),
    maxAge: 0
  });

  redirect("/login?withdrawal=requested");
}
