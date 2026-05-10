import Link from "next/link";
import Header from "@/components/Header";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회일정", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

const notices = [
  {
    category: "대회",
    date: "2026.05.10",
    title: "제27회 경희대학교 총장배 전국 골프대회 안내",
    body: "대회 일정, 장소, 참가 대상과 운영 기준을 확인하세요."
  },
  {
    category: "관리자",
    date: "2026.05.08",
    title: "참가 신청 서약서 및 개인정보 동의서 제출 안내",
    body: "선수 등록 서류는 이메일로 접수하며 관리자 승인 후 반영됩니다."
  },
  {
    category: "일반",
    date: "2026.05.05",
    title: "선수 등록은 이메일 접수 후 관리자 승인으로 진행됩니다",
    body: "가입 직후에는 GENERAL 회원이며 승인 완료 후 PLAYER로 전환됩니다."
  },
  {
    category: "대회",
    date: "2026.04.28",
    title: "대회 결과 공개 범위 안내",
    body: "공개 결과는 순위, 이름, 총타수만 표시하며 상세 스코어카드는 본인만 확인합니다."
  }
];

export default function NoticesPage() {
  return (
    <main className="home-app">
      <Header currentPath="/notices" />

      <section className="stitch-page-canvas">
        <div className="stitch-page-title">
          <p className="stitch-label">Official Notice</p>
          <h1>공지사항</h1>
          <p>최신 소식과 대회 정보를 확인하세요.</p>
        </div>

        <div className="notice-tabs" aria-label="공지 필터">
          <button className="active" type="button">전체</button>
          <button type="button">대회</button>
          <button type="button">관리자</button>
          <button type="button">일반</button>
        </div>

        <div className="stitch-notice-feed">
          {notices.map((notice) => (
            <article key={notice.title}>
              <div>
                <span>{notice.category}</span>
                <time>{notice.date}</time>
              </div>
              <h2>{notice.title}</h2>
              <p>{notice.body}</p>
            </article>
          ))}
        </div>

        <div className="notice-more">
          <button type="button">
            공지사항 더 보기
            <span className="material-symbols-outlined">expand_more</span>
          </button>
        </div>
      </section>

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {mobileNavItems.map((item) => (
          <Link className={item.href === "/notices" ? "active" : ""} href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
