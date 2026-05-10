import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회일정", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

const schedule = [
  {
    status: "진행 중",
    statusType: "live",
    name: "제27회 경희대학교 총장배 전국 골프대회",
    date: "2026.10.14 – 2026.10.16",
    venue: "경희대학교 지정 코스",
    rounds: 3
  },
  {
    status: "예정",
    statusType: "upcoming",
    name: "2026 KHU 챔피언십 시리즈 2차",
    date: "2026.11.08 – 2026.11.09",
    venue: "미정",
    rounds: 2
  },
  {
    status: "종료",
    statusType: "finished",
    name: "제26회 경희대학교 총장배 전국 골프대회",
    date: "2025.10.11 – 2025.10.13",
    venue: "경희대학교 지정 코스",
    rounds: 3
  }
];

export default function SchedulePage() {
  return (
    <main className="home-app">
      <Header currentPath="/schedule" />

      <section className="stitch-page-canvas">
        <div className="stitch-page-title">
          <p className="stitch-label">Tournament Schedule</p>
          <h1>대회일정</h1>
          <p>예정된 대회와 지난 대회 일정을 확인하세요.</p>
        </div>

        <div className="schedule-list">
          {schedule.map((event) => (
            <article className={`schedule-card ${event.statusType}`} key={event.name}>
              <div className="schedule-card-top">
                <span className={`schedule-status ${event.statusType}`}>
                  {event.statusType === "live" && <i />}
                  {event.status}
                </span>
                <span className="schedule-rounds">라운드 {event.rounds}</span>
              </div>
              <h2>{event.name}</h2>
              <div className="schedule-meta">
                <div>
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>{event.date}</span>
                </div>
                <div>
                  <span className="material-symbols-outlined">location_on</span>
                  <span>{event.venue}</span>
                </div>
              </div>
              {event.statusType === "live" && (
                <Link className="home-btn primary" href="/results" style={{ marginTop: "16px", width: "fit-content" }}>
                  라이브 스코어 보기
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <Footer />

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {mobileNavItems.map((item) => (
          <Link className={item.href === "/schedule" ? "active" : ""} href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
