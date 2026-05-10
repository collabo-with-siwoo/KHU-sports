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

const tournaments = [
  { name: "제27회 경희대학교 총장배", date: "2026.10.14 ~ 10.16", venue: "경희대 지정 코스", format: "54홀 스트로크플레이", status: "진행 중", statusType: "live" as const },
  { name: "OK금융그룹 한국대학 골프대회", date: "2026.03.10 ~ 03.13", venue: "군산CC", format: "72홀 스트로크플레이", status: "예정", statusType: "upcoming" as const },
  { name: "도미노피자배 우수대학생 골프대회", date: "2026.03.27 ~ 03.29", venue: "군산CC", format: "54홀 스트로크플레이", status: "예정", statusType: "upcoming" as const },
  { name: "그랑디 KGA 회장배 전국대학", date: "2026.05.06 ~ 05.09", venue: "군산CC", format: "72홀 스트로크플레이", status: "예정", statusType: "upcoming" as const },
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
          <div className="home-tourney-list">
            {tournaments.slice(0, 3).map((t) => (
              <Link className={`home-tourney-item ${t.statusType}`} href="/schedule" key={t.name}>
                <div className="home-tourney-item-top">
                  <strong>{t.name}</strong>
                  <span className={`home-tourney-status ${t.statusType}`}>
                    {t.statusType === "live" && <i />}
                    {t.status}
                  </span>
                </div>
                <div className="home-tourney-item-meta">
                  <span><span className="material-symbols-outlined">calendar_today</span>{t.date}</span>
                  <span><span className="material-symbols-outlined">location_on</span>{t.venue}</span>
                  <span><span className="material-symbols-outlined">sports_golf</span>{t.format}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link className="home-tourney-more" href="/schedule">
            대회 정보 더보기
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
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
