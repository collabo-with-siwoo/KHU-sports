import Link from "next/link";

export default function MyPage() {
  return (
    <main className="sub-shell">
      <header className="sub-header">
        <Link href="/">KHU Sports Golf</Link>
        <Link href="/admin">관리자</Link>
      </header>
      <section className="sub-hero">
        <div>
          <p className="eyebrow">My Page</p>
          <h1>마이페이지</h1>
          <p className="lead">
            로그인 후 본인 정보, 선수 등록 안내, 내 기록 조회를 연결합니다.
          </p>
        </div>
      </section>
      <section className="profile-preview">
        <div>
          <span>GENERAL</span>
          <strong>선수 등록이 필요합니다</strong>
          <p>PLAYER 승인 후 참가 대회와 상세 스코어카드를 확인할 수 있습니다.</p>
        </div>
        <Link className="button primary" href="/mypage">
          선수 등록 안내
        </Link>
      </section>
    </main>
  );
}
