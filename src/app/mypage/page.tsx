import Link from "next/link";

export default function MyPage() {
  return (
    <main className="sub-shell">
      <header className="sub-header">
        <Link href="/">KHU Sports Golf</Link>
        <nav>
          <Link href="/login">로그인</Link>
          <Link href="/signup">회원가입</Link>
        </nav>
      </header>
      <section className="sub-hero">
        <p className="eyebrow">My Page</p>
        <h1>내 기록</h1>
        <p className="lead">
          본인 정보, 선수 등록 안내, PLAYER 승인 후 본인 상세 스코어카드를
          확인하는 공간입니다.
        </p>
      </section>
      <section className="profile-preview">
        <div>
          <span>GENERAL</span>
          <strong>선수 등록 승인이 필요합니다</strong>
          <p>
            가입 직후에는 일반 회원으로 시작합니다. 선수 등록 서류를 이메일로
            접수하면 관리자가 확인 후 PLAYER로 전환합니다.
          </p>
          <small>접수 이메일: khusports2026@gmail.com</small>
        </div>
        <div className="profile-actions">
          <Link className="button primary" href="/login">
            로그인
          </Link>
          <Link className="button ghost" href="/signup">
            회원가입
          </Link>
        </div>
      </section>
    </main>
  );
}
