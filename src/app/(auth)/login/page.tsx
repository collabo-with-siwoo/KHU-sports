import Link from "next/link";
import { LoginForm } from "./login-form";
import { SignupSuccessModal } from "./signup-success-modal";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; signup?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const signupCompleted = params.signup === "success";
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/mypage";

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
            아이디와 비밀번호로 로그인합니다. 선수 승인 후에는 본인 상세
            스코어카드를 확인할 수 있습니다.
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">Sign In</p>
          <h2>로그인</h2>
          {signupCompleted ? <SignupSuccessModal /> : null}
          <LoginForm nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
