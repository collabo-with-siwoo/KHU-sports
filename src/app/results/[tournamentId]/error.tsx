"use client";

import Link from "next/link";

export default function ResultsDetailError({ reset }: { reset: () => void }) {
  return (
    <main className="home-app">
      <section className="stitch-page-canvas results-detail-page">
        <div className="leaderboard-empty-state">
          <span className="material-symbols-outlined">error</span>
          <strong>결과를 불러오지 못했습니다</strong>
          <p>잠시 후 다시 시도하거나 결과 목록에서 다른 대회를 선택해 주세요.</p>
          <div className="leaderboard-error-actions">
            <button onClick={reset} type="button">
              다시 시도
            </button>
            <Link href="/results">결과 목록</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
