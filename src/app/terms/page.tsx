import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { activeAgreementSeeds } from "@/lib/agreements";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

export default function TermsPage() {
  return (
    <main className="home-app">
      <Header currentPath="/terms" />

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

      <Footer />

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {mobileNavItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
