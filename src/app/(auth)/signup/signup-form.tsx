"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AgreementView } from "@/lib/agreement-service";
import { signUpAction, type AuthActionState } from "../actions";
import { SubmitButton } from "../submit-button";

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

type SignupFormProps = {
  agreements: AgreementView[];
};

export function SignupForm({ agreements }: SignupFormProps) {
  const [state, formAction] = useActionState(signUpAction, initialState);

  return (
    <>
      <form action={formAction}>
        <div className="form-grid">
          <label>
            아이디
            <input name="username" placeholder="영문+숫자 4~20자" />
          </label>
          <label>
            이름
            <input name="name" placeholder="홍길동" />
          </label>
          <label>
            비밀번호
            <input name="password" placeholder="8자 이상" type="password" />
          </label>
          <label>
            비밀번호 확인
            <input name="confirmPassword" placeholder="한 번 더 입력" type="password" />
          </label>
          <label>
            생년월일
            <input name="birthDate" type="date" />
          </label>
          <label>
            성별
            <select name="gender" defaultValue="">
              <option disabled value="">
                선택
              </option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          </label>
          <label>
            전화번호
            <input name="phone" placeholder="010-0000-0000" />
          </label>
          <label>
            이메일
            <input name="email" placeholder="player@example.com" type="email" />
          </label>
        </div>
        <label>
          주소
          <input name="address" placeholder="도로명 또는 지번 주소" />
        </label>
        <section className="agreement-box" aria-label="약관 동의">
          <div className="agreement-heading">
            <strong>약관 동의</strong>
            <span>활성 약관 자동 노출</span>
          </div>
          {agreements.map((agreement) => (
            <label className="agreement-item" key={agreement.versionId}>
              <input
                name="agreementVersionIds"
                type="checkbox"
                value={agreement.versionId}
              />
              <span>
                <b>
                  {agreement.title} v{agreement.version}
                  {agreement.required ? " (필수)" : " (선택)"}
                </b>
                <small>{agreement.content}</small>
              </span>
            </label>
          ))}
          <label className="agreement-item compact">
            <input name="ageConfirmed" type="checkbox" value="on" />
            <span>
              <b>만 14세 이상입니다 (필수)</b>
            </span>
          </label>
        </section>
        {state.message ? (
          <p className={`form-message ${state.status}`}>{state.message}</p>
        ) : null}
        <SubmitButton pendingLabel="검증 중">가입하기</SubmitButton>
      </form>
      <div className="auth-links">
        <Link href="/login">이미 계정이 있습니다</Link>
      </div>
    </>
  );
}
