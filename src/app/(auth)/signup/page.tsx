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
          <h1>일반 회원으로 가입하고 선수 등록을 신청하세요</h1>
          <p>
            가입 직후 회원 유형은 GENERAL입니다. 선수 등록 서류 접수 후
            관리자 승인으로 PLAYER 전환이 진행됩니다.
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
