import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="auth-shell">
      <section className="auth-side">
        <Link className="auth-brand" href="/">
          KHU Sports Golf
        </Link>
        <div>
          <p className="eyebrow">Password Reset</p>
          <h1>가입 이메일로 재설정 링크를 받습니다</h1>
          <p>가입한 이메일 주소로 계정 복구 절차를 진행합니다.</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Reset</p>
          <h2>비밀번호 재설정</h2>
          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
}
