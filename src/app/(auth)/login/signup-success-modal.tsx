"use client";

import { useEffect, useRef, useState } from "react";

export function SignupSuccessModal() {
  const [open, setOpen] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby="signup-success-title"
      aria-modal="true"
      className="auth-modal-backdrop"
      role="dialog"
    >
      <div className="auth-modal-card">
        <div className="auth-modal-icon">
          <span className="material-symbols-outlined">mark_email_read</span>
        </div>
        <p className="eyebrow">Email Verification</p>
        <h2 id="signup-success-title">이메일 인증을 확인해주세요</h2>
        <p>
          회원가입이 완료되었습니다. 입력하신 이메일 주소로 확인 메일을 보냈습니다.
          메일함에서 인증 링크를 눌러주세요.
        </p>
        <p>
          이메일 인증을 완료한 뒤 아이디와 비밀번호로 정상 로그인할 수 있습니다.
        </p>
        <button
          className="auth-modal-button"
          onClick={() => setOpen(false)}
          ref={closeButtonRef}
          type="button"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
}
