"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type AuthActionState } from "../actions";
import { SubmitButton } from "../submit-button";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <>
      <form action={formAction}>
        <label>
          이메일
          <input name="email" placeholder="player@example.com" type="email" />
        </label>
        {state.message ? (
          <p className={`form-message ${state.status}`}>{state.message}</p>
        ) : null}
        <SubmitButton pendingLabel="확인 중">재설정 링크 받기</SubmitButton>
      </form>
      <div className="auth-links">
        <Link href="/login">로그인으로 돌아가기</Link>
      </div>
    </>
  );
}
