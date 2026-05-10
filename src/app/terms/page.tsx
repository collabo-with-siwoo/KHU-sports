import Link from "next/link";
import { activeAgreementSeeds } from "@/lib/agreements";

const navItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "리더보드", icon: "leaderboard", href: "/results" },
  { label: "공지사항", icon: "campaign", href: "/notices" },
  { label: "내 기록", icon: "history_edu", href: "/mypage" }
];

export default function TermsPage() {
  return (
    <main className="stitch-app">
      <header className="stitch-topbar">
        <Link className="stitch-brand" href="/">
          <span>KHU</span>
          <strong>KHU 경희대학교 총장배</strong>
        </Link>
        <nav className="stitch-desktop-nav" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link aria-label="로그인" className="stitch-icon-button" href="/login">
          <span className="material-symbols-outlined">account_circle</span>
        </Link>
      </header>

      <section className="stitch-page-canvas">
        <div className="stitch-page-title">
          <p className="stitch-label">Agreements</p>
          <h1>약관</h1>
          <p>
            운영 환경에서는 관리자 약관 관리에서 활성화된 최신 버전만 노출합니다.
          </p>
        </div>

        <div className="stitch-notice-feed">
          {activeAgreementSeeds.map((agreement) => (
            <article key={agreement.versionId}>
              <div>
                <span>{agreement.required ? "필수" : "선택"}</span>
                <time>version {agreement.version}</time>
              </div>
              <h2>{agreement.title}</h2>
              <p>{agreement.content}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
