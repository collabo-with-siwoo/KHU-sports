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
          <h1>가입 이메일로 재설정 링크를 보냅니다</h1>
          <p>Resend 또는 Supabase 메일 설정이 연결되면 30분 만료 링크를 발송합니다.</p>
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
