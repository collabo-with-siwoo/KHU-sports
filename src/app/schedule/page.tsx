import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

const tournaments = [
  {
    status: "진행 중",
    statusType: "live",
    name: "제27회 경희대학교 총장배 전국 골프대회",
    sponsor: "경희대학교",
    date: "2026.10.14 (수) ~ 10.16 (금)",
    venue: "경희대학교 지정 코스",
    distance: "예선 6,400yds / 본선 6,400yds",
    par: "72",
    format: "54홀 스트로크플레이",
    organizer: "KHU Sports 운영국 / khusports2026@gmail.com",
    prize: "비공개 (학교 주관)"
  },
  {
    status: "예정",
    statusType: "upcoming",
    name: "제43회 OK금융그룹 한국대학 골프대회",
    sponsor: "OK금융그룹",
    date: "2026.03.10 (화) ~ 03.13 (금)",
    venue: "군산CC",
    distance: "예선 6,762yds / 본선 6,762yds",
    par: "72",
    format: "72홀 스트로크플레이",
    organizer: "한국대학골프연맹(KCGF) / 031-708-8724",
    prize: "연맹 규정에 따름"
  },
  {
    status: "예정",
    statusType: "upcoming",
    name: "2026 도미노피자배 우수대학생 골프대회",
    sponsor: "도미노피자",
    date: "2026.03.27 (금) ~ 03.29 (일)",
    venue: "군산CC",
    distance: "6,500yds",
    par: "72",
    format: "54홀 스트로크플레이",
    organizer: "한국대학골프연맹(KCGF) / 031-708-8724",
    prize: "총 2,000만원"
  },
  {
    status: "예정",
    statusType: "upcoming",
    name: "2026 그랑디 KGA 회장배 전국대학 골프대회",
    sponsor: "그랑디",
    date: "2026.05.06 (수) ~ 05.09 (토)",
    venue: "군산CC",
    distance: "6,800yds",
    par: "72",
    format: "72홀 스트로크플레이",
    organizer: "대한골프협회(KGA) / 02-783-0101",
    prize: "총 3,000만원"
  },
  {
    status: "예정",
    statusType: "upcoming",
    name: "제43회 회장배 대학 대항 골프대회",
    sponsor: "한국대학골프연맹",
    date: "2026.07.21 (화) ~ 07.24 (금)",
    venue: "군산CC",
    distance: "6,762yds",
    par: "72",
    format: "72홀 스트로크플레이 (단체전)",
    organizer: "한국대학골프연맹(KCGF) / 031-708-8724",
    prize: "연맹 규정에 따름"
  },
  {
    status: "예정",
    statusType: "upcoming",
    name: "2026 전국 대학 골프 선수권 대회",
    sponsor: "골프존카운티",
    date: "2026.07.28 (화) ~ 07.30 (목)",
    venue: "골프존카운티 오라",
    distance: "6,600yds",
    par: "72",
    format: "54홀 스트로크플레이",
    organizer: "한국대학골프연맹(KCGF) / 031-708-8724",
    prize: "총 1,500만원"
  },
  {
    status: "종료",
    statusType: "finished",
    name: "제26회 경희대학교 총장배 전국 골프대회",
    sponsor: "경희대학교",
    date: "2025.10.11 (토) ~ 10.13 (월)",
    venue: "경희대학교 지정 코스",
    distance: "6,400yds",
    par: "72",
    format: "54홀 스트로크플레이",
    organizer: "KHU Sports 운영국",
    prize: "비공개 (학교 주관)"
  }
];

const infoRows: { icon: string; label: string; key: keyof typeof tournaments[0] }[] = [
  { icon: "apartment", label: "스폰서", key: "sponsor" },
  { icon: "calendar_today", label: "일정", key: "date" },
  { icon: "location_on", label: "장소/코스", key: "venue" },
  { icon: "straighten", label: "전장거리", key: "distance" },
  { icon: "flag", label: "기준파", key: "par" },
  { icon: "sports_golf", label: "경기방식", key: "format" },
  { icon: "emoji_events", label: "총상금", key: "prize" },
  { icon: "call", label: "대행사/연락처", key: "organizer" }
];

export default function SchedulePage() {
  return (
    <main className="home-app">
      <Header currentPath="/schedule" />

      <section className="stitch-page-canvas">
        <div className="tourney-page-header">
          <div>
            <p className="stitch-label">Tournament Info</p>
            <h1>대회정보</h1>
            <p>KHU Sports 관련 주요 대학 골프대회의 상세 정보를 확인하세요.</p>
          </div>
          <div className="tourney-search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="대회명 검색..." />
          </div>
        </div>

        {/* Filter */}
        <div className="tourney-filters">
          <button className="active" type="button">전체</button>
          <button type="button">진행 중</button>
          <button type="button">예정</button>
          <button type="button">종료</button>
        </div>

        {/* Tournament Cards */}
        <div className="tourney-list">
          {tournaments.map((t) => (
            <article className={`tourney-card ${t.statusType}`} key={t.name}>
              <div className="tourney-card-left">
                <div className="tourney-card-status-row">
                  <span className={`tourney-status ${t.statusType}`}>
                    {t.statusType === "live" && <i />}
                    {t.status}
                  </span>
                </div>
                <h2>{t.name}</h2>
              </div>
              <div className="tourney-card-info">
                {infoRows.map((row) => (
                  <div className="tourney-info-row" key={row.key}>
                    <div className="tourney-info-label">
                      <span className="material-symbols-outlined">{row.icon}</span>
                      <span>{row.label}</span>
                    </div>
                    <span className="tourney-info-value">{String(t[row.key])}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="notices-pagination">
          <button type="button" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
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
