import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { listPublishedNotices } from "@/lib/notices";

const heroBackgroundUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC1AWWs8FEyFx31sSOG-AP7Y_Vu-PfrUdJPPeHErDTXqEM_f2gpYQQsC7swnWFOkLxghN5vvwJ7km__bMzwWjtca5E0AdTwRPlVT1ordq-RqDRdA8g8hI1lw-t-idqokTQbbaydUynXbbk2zXCqLPPlA_BlAfcRyGMpoI6CJ7h-vHO9o2WrAizCPMQnN9Tv2GIujQB5KObneFQynkx_HUfs_HBDCI6d2Fknzf1VA63ZQL99EVkxBLTNmcPAVO94W_7GkRrf4PsFn0P4";

const weatherImgUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBuFw25q4FMGCj_FSURyPmFVb3JxQ-weBC3NW4tGdogCmPSSEhcRZbDLaZv-tv95rwQbFUMMYeb1xjZD6WR-KTB756oZBhOdhwsyAlhk-doN-FPndTNVyd-Pni9lGq81QgoO5dBlg-5ojQLIZeCW5LLAtQMeLYCBPNoTQfTApeqJLxENsarmZXeKNrON5SHe5QsX4oijUQF6LxLHzBDY650o5Uu9rDY_zrBh-lUdSCTz1rXl75XfUv2bM2KNSZuMHhevuvjeB6oZXRk";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

const tournamentInfo = [
  { icon: "calendar_today", label: "일정", value: "2026.10.14 (수) ~ 10.16 (금)" },
  { icon: "location_on", label: "장소", value: "경희대학교 지정 코스" },
  { icon: "sports_golf", label: "경기방식", value: "54홀 스트로크플레이" },
  { icon: "flag", label: "기준파", value: "72 (전장 6,400yds)" },
  { icon: "groups", label: "참가대상", value: "재학생 · 졸업생 · 교직원 · 초청" },
  { icon: "mail", label: "접수", value: "khusports2026@gmail.com" }
];

export const revalidate = 60;

export default async function HomePage() {
  const recentNotices = (await listPublishedNotices()).slice(0, 3);

  return (
    <main className="home-app">
      <Header currentPath="/" />

      {/* ===== HERO ===== */}
      <section
        className="home-hero"
        style={{ backgroundImage: `url("${heroBackgroundUrl}")` }}
      >
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <h1>경희대학교 총장배<br />전국 골프대회</h1>
          <p>
            27년 전통의 경희대학교 총장배 골프대회.<br />
            대회 정보 확인, 경기 결과 조회, 참가 신청까지 KHU Sports에서 함께하세요.
          </p>
        </div>
      </section>

      {/* ===== CONTENT GRID ===== */}
      <section className="home-content">
        <div className="home-leaderboard-card">
          <div className="home-card-header">
            <div className="home-card-title">
              <span className="material-symbols-outlined">emoji_events</span>
              <h2>대회 정보</h2>
            </div>
            <Link className="home-view-all" href="/schedule">전체 보기</Link>
          </div>
          <div className="home-tourney-info">
            <h3>제27회 경희대학교 총장배 전국 골프대회</h3>
            {tournamentInfo.map((item) => (
              <div className="home-tourney-row" key={item.label}>
                <div className="home-tourney-label">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="home-tourney-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-sidebar">
          <div
            className="home-weather-card"
            style={{ backgroundImage: `url("${weatherImgUrl}")` }}
          >
            <div className="home-weather-overlay" />
            <div className="home-weather-content">
              <p>코스 날씨</p>
              <div className="home-weather-temp">
                <strong>24°C</strong>
                <div>
                  <span className="material-symbols-outlined">wb_sunny</span>
                  <small>맑음<br />풍속: 4 km/h</small>
                </div>
              </div>
            </div>
          </div>

          <div className="home-notices-card">
            <div className="home-card-header">
              <div className="home-card-title">
                <span className="material-symbols-outlined">notifications_active</span>
                <h2>최신 공지사항</h2>
              </div>
            </div>
            {recentNotices.map((notice) => (
              <Link className="home-notice-row" href={`/notices/${notice.id}`} key={notice.id}>
                <time dateTime={notice.publishedAt}>{notice.publishedLabel}</time>
                <strong>{notice.title}</strong>
              </Link>
            ))}
            <Link className="home-notices-more" href="/notices">
              모든 공지 보기
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {mobileNavItems.map((item) => (
          <Link className={item.href === "/" ? "active" : ""} href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
