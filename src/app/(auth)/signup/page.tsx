import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="auth-shell signup-shell">
      <section className="auth-side">
        <Link className="auth-brand" href="/">
          KHU Sports Golf
        </Link>
        <div>
          <p className="eyebrow">Create Account</p>
          <h1>일반 회원으로 가입 후 선수 등록을 신청합니다</h1>
          <p>
            가입 직후 회원 유형은 GENERAL이며, 이메일 서류 접수와 관리자 승인
            후 PLAYER로 전환됩니다.
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card signup-card">
          <p className="eyebrow">Join</p>
          <h2>회원가입</h2>
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
