"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ── 데이터 ── */
const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

const tournaments = [
  { id: "t27", name: "제27회 경희대학교 총장배", venue: "경희대 지정 코스", status: "진행 중" },
  { id: "t26", name: "제26회 경희대학교 총장배", venue: "경희대 지정 코스", status: "종료" }
];

const rounds = ["1R", "2R", "FR"] as const;
type ViewMode = "leaderboard" | "scorecard";

interface Player {
  rank: string;
  move: string;
  name: string;
  affiliation: string;
  total: number;
  topar: number;
  progress: string;
  today: number;
  r1: number;
  r2: number;
  r3: number;
  holes: number[]; // 18 holes for selected round
}

const players: Player[] = [
  { rank: "1", move: "-", name: "김서준", affiliation: "경희대", total: 202, topar: -14, progress: "F", today: -3, r1: 65, r2: 68, r3: 69, holes: [4,4,3,5,3,3,4,5,4, 4,5,4,3,4,3,3,4,4] },
  { rank: "2", move: "▲5", name: "박도윤", affiliation: "연세대", total: 204, topar: -12, progress: "F", today: -8, r1: 70, r2: 70, r3: 64, holes: [4,4,3,4,3,4,4,3, 3,4,4,4,3,4,3,4,4,4] },
  { rank: "T3", move: "▲4", name: "이하린", affiliation: "고려대", total: 205, topar: -11, progress: "F", today: -7, r1: 72, r2: 68, r3: 65, holes: [3,4,3,5,3,4,2,4,3, 4,5,3,3,4,3,4,4,4] },
  { rank: "T3", move: "▲1", name: "정민재", affiliation: "경희대", total: 205, topar: -11, progress: "F", today: -6, r1: 69, r2: 70, r3: 66, holes: [3,3,3,4,2,4,4,4,3, 4,4,4,4,5,4,2,5,4] },
  { rank: "5", move: "▼3", name: "최유진", affiliation: "성균관대", total: 206, topar: -10, progress: "F", today: -4, r1: 72, r2: 66, r3: 68, holes: [4,4,4,2,5,3,4,3,4, 4,4,3,4,3,5,5,3,3] },
  { rank: "6", move: "▲6", name: "한서윤", affiliation: "중앙대", total: 207, topar: -9, progress: "F", today: -6, r1: 69, r2: 72, r3: 66, holes: [4,3,4,3,4,3,4,4,4, 4,4,4,3,4,3,2,5,4] },
  { rank: "T7", move: "▲5", name: "오민석", affiliation: "경희대", total: 208, topar: -8, progress: "F", today: -5, r1: 69, r2: 72, r3: 67, holes: [4,4,2,5,2,4,5,3,4, 5,4,2,4,3,3,4,4,4] },
  { rank: "T7", move: "▲5", name: "윤지호", affiliation: "한양대", total: 208, topar: -8, progress: "F", today: -5, r1: 70, r2: 71, r3: 67, holes: [5,2,4,4,4,4,4,4,3, 4,3,4,3,4,4,4,4,4] },
  { rank: "T7", move: "▼3", name: "임다은", affiliation: "이화여대", total: 208, topar: -8, progress: "F", today: -3, r1: 73, r2: 66, r3: 69, holes: [4,4,4,3,4,4,3,4,4, 4,4,4,2,3,5,4,5,4] },
  { rank: "T10", move: "▲20", name: "송현우", affiliation: "서강대", total: 209, topar: -7, progress: "F*", today: -6, r1: 69, r2: 74, r3: 66, holes: [4,4,2,5,3,3,3,5,5, 3,4,5,3,2,4,3,2,5] },
  { rank: "T10", move: "▼8", name: "장예린", affiliation: "경희대", total: 209, topar: -7, progress: "F", today: -1, r1: 67, r2: 71, r3: 71, holes: [5,2,4,4,3,5,2,4,4, 5,5,5,3,4,3,5,3,4] }
];

const par = [4,4,3,5,3,4,4,5,4, 4,5,4,3,4,3,3,5,4]; // 18 holes

/* ── 컴포넌트 ── */
export default function ResultsPage() {
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0].id);
  const [selectedRound, setSelectedRound] = useState<string>("FR");
  const [viewMode, setViewMode] = useState<ViewMode>("leaderboard");

  const tournament = tournaments.find(t => t.id === selectedTournament)!;

  return (
    <main className="home-app">
      <Header currentPath="/results" />

      <section className="stitch-page-canvas results-page">
        {/* 타이틀 */}
        <div className="results-title">
          <h1>경기결과</h1>
        </div>

        {/* 대회 선택 */}
        <div className="results-tournament-select">
          {tournaments.map(t => (
            <button
              key={t.id}
              className={selectedTournament === t.id ? "active" : ""}
              type="button"
              onClick={() => setSelectedTournament(t.id)}
            >
              <strong>{t.name}</strong>
              <small>{t.venue} · {t.status}</small>
            </button>
          ))}
        </div>

        {/* 라운드 탭 + 뷰 토글 */}
        <div className="results-controls">
          <div className="results-round-tabs">
            {rounds.map(r => (
              <button
                key={r}
                className={selectedRound === r ? "active" : ""}
                type="button"
                onClick={() => setSelectedRound(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="results-view-toggle">
            <button
              className={viewMode === "leaderboard" ? "active" : ""}
              type="button"
              onClick={() => setViewMode("leaderboard")}
            >
              FULL LEADERBOARD
            </button>
            <button
              className={viewMode === "scorecard" ? "active" : ""}
              type="button"
              onClick={() => setViewMode("scorecard")}
            >
              SCORECARD
            </button>
          </div>
        </div>

        <p className="results-note">* 현지시간 기준</p>

        {/* FULL LEADERBOARD */}
        {viewMode === "leaderboard" && (
          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>FAV</th>
                  <th>순위</th>
                  <th>등락</th>
                  <th>선수명</th>
                  <th>소속</th>
                  <th className="num">합계</th>
                  <th className="num">진행홀</th>
                  <th className="num">오늘</th>
                  <th className="num">1R</th>
                  <th className="num">2R</th>
                  <th className="num">3R</th>
                  <th className="num total">합계</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr key={p.name} className={i === 0 ? "leader-row" : ""}>
                    <td><span className="material-symbols-outlined fav-star">star_border</span></td>
                    <td className="rank-cell">{p.rank}</td>
                    <td className={`move-cell ${p.move.includes("▲") ? "up" : p.move.includes("▼") ? "down" : ""}`}>
                      {p.move}
                    </td>
                    <td className="name-cell">{p.name}</td>
                    <td className="aff-cell">{p.affiliation}</td>
                    <td className="num topar">{p.topar}</td>
                    <td className="num">{p.progress}</td>
                    <td className="num today">{p.today}</td>
                    <td className="num">{p.r1}</td>
                    <td className="num">{p.r2}</td>
                    <td className="num">{p.r3}</td>
                    <td className="num total">{p.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SCORECARD */}
        {viewMode === "scorecard" && (
          <div className="lb-table-wrap">
            <table className="sc-table">
              <thead>
                <tr>
                  <th>FAV</th>
                  <th>순위</th>
                  <th>선수명</th>
                  <th className="num">합계</th>
                  <th className="num">오늘</th>
                  {Array.from({ length: 9 }, (_, i) => (
                    <th className="hole-num" key={`h${i + 1}`}>{i + 1}</th>
                  ))}
                  <th className="hole-out">OUT</th>
                  {Array.from({ length: 9 }, (_, i) => (
                    <th className="hole-num" key={`h${i + 10}`}>{i + 10}</th>
                  ))}
                  <th className="hole-out">IN</th>
                  <th className="num">1R</th>
                  <th className="num">2R</th>
                  <th className="num">3R</th>
                  <th className="num total">TOT</th>
                </tr>
                <tr className="par-row">
                  <td colSpan={5}>PAR</td>
                  {par.slice(0, 9).map((p, i) => <td key={`p${i}`}>{p}</td>)}
                  <td className="hole-out">{par.slice(0, 9).reduce((a, b) => a + b, 0)}</td>
                  {par.slice(9).map((p, i) => <td key={`p${i + 9}`}>{p}</td>)}
                  <td className="hole-out">{par.slice(9).reduce((a, b) => a + b, 0)}</td>
                  <td colSpan={4}></td>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => {
                  const out = p.holes.slice(0, 9).reduce((a, b) => a + b, 0);
                  const inn = p.holes.slice(9).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={p.name} className={i === 0 ? "leader-row" : ""}>
                      <td><span className="material-symbols-outlined fav-star">star_border</span></td>
                      <td className="rank-cell">{p.rank}</td>
                      <td className="name-cell">{p.name}</td>
                      <td className="num topar">{p.topar}</td>
                      <td className="num today">{p.today}</td>
                      {p.holes.slice(0, 9).map((h, hi) => (
                        <td key={`h${hi}`} className={`hole-score ${h < par[hi] ? "birdie" : h > par[hi] ? "bogey" : ""}`}>
                          {h}
                        </td>
                      ))}
                      <td className="hole-out">{out}</td>
                      {p.holes.slice(9).map((h, hi) => (
                        <td key={`h${hi + 9}`} className={`hole-score ${h < par[hi + 9] ? "birdie" : h > par[hi + 9] ? "bogey" : ""}`}>
                          {h}
                        </td>
                      ))}
                      <td className="hole-out">{inn}</td>
                      <td className="num">{p.r1}</td>
                      <td className="num">{p.r2}</td>
                      <td className="num">{p.r3}</td>
                      <td className="num total">{p.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
