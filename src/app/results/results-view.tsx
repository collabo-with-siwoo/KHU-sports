"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { PublicTournamentResult } from "@/lib/results";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

type ViewMode = "leaderboard" | "summary";

type ResultsViewProps = {
  tournaments: PublicTournamentResult[];
};

export function ResultsView({ tournaments }: ResultsViewProps) {
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]?.id ?? "");
  const [viewMode, setViewMode] = useState<ViewMode>("leaderboard");
  const currentTournament = useMemo(
    () => tournaments.find((tournament) => tournament.id === selectedTournament) ?? tournaments[0],
    [selectedTournament, tournaments]
  );
  const roundLabels = Array.from(
    { length: Math.max(currentTournament?.rounds ?? 1, 1) },
    (_, index) => `${index + 1}R`
  );

  return (
    <main className="home-app">
      <Header currentPath="/results" />

      <section className="stitch-page-canvas results-page">
        <div className="results-title">
          <h1>경기결과</h1>
        </div>

        <div className="results-tournament-select">
          {tournaments.map((tournament) => (
            <button
              className={selectedTournament === tournament.id ? "active" : ""}
              key={tournament.id}
              onClick={() => setSelectedTournament(tournament.id)}
              type="button"
            >
              <strong>{tournament.name}</strong>
              <small>
                {tournament.venue} · {tournament.status}
              </small>
            </button>
          ))}
        </div>

        <div className="results-controls">
          <div className="results-round-tabs">
            {roundLabels.map((round) => (
              <button className="active" disabled key={round} type="button">
                {round}
              </button>
            ))}
          </div>
          <div className="results-view-toggle">
            <button
              className={viewMode === "leaderboard" ? "active" : ""}
              onClick={() => setViewMode("leaderboard")}
              type="button"
            >
              FULL LEADERBOARD
            </button>
            <button
              className={viewMode === "summary" ? "active" : ""}
              onClick={() => setViewMode("summary")}
              type="button"
            >
              SCORECARD 안내
            </button>
          </div>
        </div>

        <p className="results-note">
          공개 결과는 순위, 선수명, 총타수까지만 제공합니다. 상세 스코어카드는 로그인 후
          본인 기록에서만 확인할 수 있습니다.
        </p>

        {viewMode === "leaderboard" ? (
          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>선수명</th>
                  <th>소속</th>
                  <th className="num">합계</th>
                  <th className="num">진행</th>
                  {roundLabels.map((round) => (
                    <th className="num" key={round}>
                      {round}
                    </th>
                  ))}
                  <th className="num total">총타수</th>
                </tr>
              </thead>
              <tbody>
                {currentTournament?.rows.map((player, index) => (
                  <tr className={index === 0 ? "leader-row" : ""} key={player.name}>
                    <td className="rank-cell">{player.rank}</td>
                    <td className="name-cell">{player.name}</td>
                    <td className="aff-cell">{player.affiliation}</td>
                    <td className="num topar">{player.topar}</td>
                    <td className="num">{player.progress}</td>
                    {roundLabels.map((round, roundIndex) => (
                      <td className="num" key={`${player.name}-${round}`}>
                        {player.roundTotals[roundIndex] ?? "-"}
                      </td>
                    ))}
                    <td className="num total">{player.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="result-privacy-panel">
            <span className="material-symbols-outlined">lock</span>
            <div>
              <strong>상세 스코어카드는 비공개입니다</strong>
              <p>
                PRD 정책에 따라 다른 선수의 홀별 상세 기록은 공개하지 않습니다. 선수 본인은
                로그인 후 마이페이지에서 자신의 상세 스코어카드를 확인할 수 있습니다.
              </p>
              <Link href="/mypage">내 기록 확인</Link>
            </div>
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

