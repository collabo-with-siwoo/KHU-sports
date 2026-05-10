import Link from "next/link";

const notices = [
  "제27회 경희대학교 총장배 전국 골프대회 안내",
  "참가자 안전 서약서 및 개인정보 동의서 제출 안내",
  "대회 결과 공개 범위 및 상세 스코어 조회 정책"
];

export default function NoticesPage() {
  return (
    <main className="sub-shell">
      <header className="sub-header">
        <Link href="/">KHU Sports Golf</Link>
        <Link href="/admin">관리자</Link>
      </header>
      <section className="sub-hero">
        <div>
          <p className="eyebrow">Notices</p>
          <h1>대회 공지</h1>
          <p className="lead">공지 목록, 검색, 카테고리 필터가 연결될 영역입니다.</p>
        </div>
      </section>
      <section className="list-section">
        {notices.map((notice, index) => (
          <Link className="list-item" href="/notices" key={notice}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{notice}</strong>
            <em>자세히</em>
          </Link>
        ))}
      </section>
    </main>
  );
}
