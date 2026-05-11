"use client";

import { useActionState } from "react";
import { adminSignInAction, type AdminActionState } from "./actions";
import { SubmitButton } from "@/app/(auth)/submit-button";

const initialState: AdminActionState = {
  status: "idle",
  message: ""
};

type AdminLoginFormProps = {
  nextPath: string;
};

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const [state, formAction] = useActionState(adminSignInAction, initialState);

  return (
    <form action={formAction} className="admin-login-card">
      <div>
        <p className="panel-kicker">Secure Access</p>
        <strong>관리자 로그인</strong>
      </div>
      <input name="next" type="hidden" value={nextPath} />
      <label>
        이메일
        <input autoComplete="email" name="email" placeholder="admin@example.com" type="email" />
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
      <p className="admin-note">활성화된 관리자 계정만 운영 콘솔에 접근할 수 있습니다.</p>
    </form>
  );
}

