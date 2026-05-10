import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-side">
        <Link className="auth-brand" href="/">
          KHU Sports Golf
        </Link>
        <div>
          <p className="eyebrow">Member Login</p>
          <h1>아이디로 로그인하고 내 기록을 확인하세요</h1>
          <p>
            내부 인증은 Supabase Auth와 연결되며, 사용자는 PRD 정책에 따라
            아이디와 비밀번호로 로그인합니다.
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Sign In</p>
          <h2>로그인</h2>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
