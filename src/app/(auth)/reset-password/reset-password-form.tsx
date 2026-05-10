"use client";

import Link from "next/link";
import { useState } from "react";
import {
  validateResetPasswordForm,
  type ClientValidationResult
} from "@/lib/auth/client-validation";
import { SubmitButton } from "../submit-button";

const initialState: ClientValidationResult = {
  status: "idle",
  message: ""
};

export function ResetPasswordForm() {
  const [state, setState] = useState(initialState);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState(validateResetPasswordForm(new FormData(event.currentTarget)));
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
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
