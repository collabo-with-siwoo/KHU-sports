"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type AuthActionState } from "../actions";
import { SubmitButton } from "../submit-button";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <>
      <form action={formAction}>
        <label>
          아이디
          <input autoComplete="username" name="username" placeholder="khugolf2026" />
        </label>
        <label>
          비밀번호
          <input
            autoComplete="current-password"
            name="password"
            placeholder="비밀번호"
            type="password"
          />
        </label>
        {state.message ? (
          <p className={`form-message ${state.status}`}>{state.message}</p>
        ) : null}
        <SubmitButton pendingLabel="확인 중">로그인</SubmitButton>
      </form>
      <div className="auth-links">
        <Link href="/signup">회원가입</Link>
        <Link href="/reset-password">비밀번호 재설정</Link>
      </div>
    </>
  );
}
