import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="home-app forbidden-page">
      <section className="result-privacy-panel forbidden-panel">
        <span className="material-symbols-outlined">lock</span>
        <div>
          <strong>403 접근할 수 없는 기록입니다</strong>
          <p>로그인한 선수 본인에게 연결된 대회 기록만 확인할 수 있습니다.</p>
          <Link href="/mypage/scores">내 기록 아카이브로 돌아가기</Link>
        </div>
      </section>
    </main>
  );
}
