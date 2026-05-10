import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

const rows = [
  { rank: 1, name: "김서준", team: "경희대학교", diff: "-2", total: 70, initials: "KS" },
  { rank: 2, name: "박도윤", team: "동문회", diff: "E", total: 72, initials: "PD" },
  { rank: 3, name: "이하린", team: "경희대학교", diff: "+1", total: 73, initials: "LH" },
  { rank: 4, name: "정민재", team: "게스트", diff: "+2", total: 74, initials: "JM" },
  { rank: 5, name: "최지우", team: "경희대학교", diff: "+3", total: 75, initials: "CJ" }
];

export default function ResultsPage() {
  return (
    <main className="home-app">
      <Header currentPath="/results" />

      <section className="stitch-page-canvas leaderboard-page">
        <div className="stitch-page-title">
          <div>
            <span className="live-chip">
              <i />
              공개
            </span>
            <span className="round-label">라운드 1 · 경희대학교 지정 코스</span>
          </div>
          <h1>리더보드</h1>
        </div>

        <div className="stitch-filterbar">
          <label>
            <span className="material-symbols-outlined">search</span>
            <input placeholder="선수명 검색" />
          </label>
          <button type="button">
            <span className="material-symbols-outlined">tune</span>
            필터
          </button>
        </div>

        <div className="stitch-score-table">
          <div className="score-head">
            <span>순위</span>
            <span>선수명</span>
            <span>대비</span>
            <span>총타</span>
          </div>
          {rows.map((row) => (
            <article className={row.rank === 1 ? "score-row leader" : "score-row"} key={row.rank}>
              <div>
                <span>{row.rank}</span>
              </div>
              <div className="player-cell">
                <i>{row.initials}</i>
                <span>
                  <strong>{row.name}</strong>
                  <small>{row.team}</small>
                </span>
              </div>
              <b>{row.diff}</b>
              <em>{row.total}</em>
            </article>
          ))}
          <footer>
            <button type="button">선수 더 보기</button>
          </footer>
        </div>
      </section>

      <Footer />

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {mobileNavItems.map((item) => (
          <Link className={item.href === "/results" ? "active" : ""} href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
