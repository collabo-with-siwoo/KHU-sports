import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const heroBackgroundUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC1AWWs8FEyFx31sSOG-AP7Y_Vu-PfrUdJPPeHErDTXqEM_f2gpYQQsC7swnWFOkLxghN5vvwJ7km__bMzwWjtca5E0AdTwRPlVT1ordq-RqDRdA8g8hI1lw-t-idqokTQbbaydUynXbbk2zXCqLPPlA_BlAfcRyGMpoI6CJ7h-vHO9o2WrAizCPMQnN9Tv2GIujQB5KObneFQynkx_HUfs_HBDCI6d2Fknzf1VA63ZQL99EVkxBLTNmcPAVO94W_7GkRrf4PsFn0P4";

const weatherImgUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBuFw25q4FMGCj_FSURyPmFVb3JxQ-weBC3NW4tGdogCmPSSEhcRZbDLaZv-tv95rwQbFUMMYeb1xjZD6WR-KTB756oZBhOdhwsyAlhk-doN-FPndTNVyd-Pni9lGq81QgoO5dBlg-5ojQLIZeCW5LLAtQMeLYCBPNoTQfTApeqJLxENsarmZXeKNrON5SHe5QsX4oijUQF6LxLHzBDY650o5Uu9rDY_zrBh-lUdSCTz1rXl75XfUv2bM2KNSZuMHhevuvjeB6oZXRk";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회일정", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

const leaderboard = [
  { rank: 1, name: "김서연", holes: 15, score: "-4", total: 208, avatar: "KS" },
  { rank: 2, name: "박지훈", holes: 14, score: "-2", total: 210, avatar: "PJ" },
  { rank: 3, name: "이민재", holes: 18, score: "E", total: 212, avatar: "LM" },
  { rank: 4, name: "최다니엘", holes: 12, score: "+1", total: 213, avatar: "CD" }
];

const recentNotices = [
  { date: "2026년 10월 14일", title: "토요일 파이널 라운드 티타임 변경 안내" },
  { date: "2026년 10월 12일", title: "선수 필수 브리핑: 14번 홀 로컬 룰 안내" },
  { date: "2026년 10월 10일", title: "동문 주말 주차 및 셔틀 버스 이용 안내" }
];

export default function HomePage() {
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
          <span className="home-live-badge">
            <i />
            실시간 대회 중
          </span>
          <h1>2026 KHU 챔피언십 시리즈</h1>
          <p>
            최고의 대학 골프 대회를 경험해 보세요. 명문 하이랜드 그린스에서 올해의
            챔피언을 가리는 영광의 순간에 함께하십시오.
          </p>
          <div className="home-hero-actions">
            <Link className="home-btn primary" href="/results">
              라이브 스코어
            </Link>
            <Link className="home-btn outline" href="/schedule">
              일정 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CONTENT GRID ===== */}
      <section className="home-content">
        <div className="home-leaderboard-card">
          <div className="home-card-header">
            <div className="home-card-title">
              <span className="material-symbols-outlined">leaderboard</span>
              <h2>실시간 리더보드</h2>
            </div>
            <Link className="home-view-all" href="/results">전체 보기</Link>
          </div>
          <div className="home-lb-head">
            <span>순위</span>
            <span>선수</span>
            <span>진행</span>
            <span>스코어</span>
            <span>합계</span>
          </div>
          {leaderboard.map((player) => (
            <div className={`home-lb-row${player.rank === 1 ? " leader" : ""}`} key={player.rank}>
              <span className="home-lb-rank">{player.rank}</span>
              <div className="home-lb-player">
                <i>{player.avatar}</i>
                <strong>{player.name}</strong>
              </div>
              <span>{player.holes}</span>
              <span className={Number(player.score) < 0 ? "score-under" : ""}>{player.score}</span>
              <b>{player.total}</b>
            </div>
          ))}
        </div>

        <div className="home-sidebar">
          <div
            className="home-weather-card"
            style={{ backgroundImage: `url("${weatherImgUrl}")` }}
          >
            <div className="home-weather-overlay" />
            <div className="home-weather-content">
              <p>실시간 코스 날씨</p>
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
              <div className="home-notice-row" key={notice.title}>
                <time>{notice.date}</time>
                <strong>{notice.title}</strong>
              </div>
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
