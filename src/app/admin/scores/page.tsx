import Link from "next/link";
import { confirmScoreAction, rejectScoreAction } from "./actions";
import { ScoreForm } from "./score-form";
import { requireAdminPermission } from "@/lib/admin/auth";
import { formatToPar, listAdminScoreRows, listAdminTournaments } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function AdminScoresPage() {
  await requireAdminPermission("scores", "read", "/admin/scores");
  const [tournaments, scores] = await Promise.all([listAdminTournaments(), listAdminScoreRows()]);

  return (
    <main className="admin-workspace">
      <header className="admin-workspace-header">
        <Link className="admin-home-link dark" href="/admin">
          KHU Sports Admin
        </Link>
        <Link className="admin-secondary-link" href="/results">
          경기결과 보기
        </Link>
      </header>

      <section className="admin-workspace-main">
        <div className="admin-page-heading">
          <div>
            <p className="panel-kicker">M4 Scores</p>
            <h1>스코어 관리</h1>
            <p>
              선수 제출 스코어를 검수해 확정하거나 반려합니다. 공식 결과 페이지와 공개 Scorecard에는 관리자
              확정 스코어만 반영됩니다.
            </p>
          </div>
        </div>

        <ScoreForm tournaments={tournaments} />

        <div className="admin-notice-table">
          <div className="admin-notice-head score-grid">
            <span>대회</span>
            <span>선수</span>
            <span>라운드</span>
            <span>총타수</span>
            <span>검수</span>
          </div>
          {scores.map((score) => (
            <div className="admin-notice-row score-grid" key={score.id}>
              <span>{score.tournamentName}</span>
              <strong>
                {score.playerName} · {score.affiliation}
              </strong>
              <time>{score.round}R</time>
              <em>
                {score.total}타 ({formatToPar(score.toPar)}){score.rank ? ` · ${score.rank}위` : ""}
              </em>
              <div className="admin-score-review">
                <span className={`score-status-badge ${score.status.toLowerCase().replaceAll("_", "-")}`}>
                  {score.statusLabel}
                </span>
                <small>{score.statusMessage}</small>
                {score.playerMemo ? <small>선수 메모: {score.playerMemo}</small> : null}
                {score.rejectionReason ? <small>반려 사유: {score.rejectionReason}</small> : null}
                <form action={confirmScoreAction}>
                  <input name="scoreId" type="hidden" value={score.id} />
                  <button type="submit">확정</button>
                </form>
                <form action={rejectScoreAction}>
                  <input name="scoreId" type="hidden" value={score.id} />
                  <input name="rejectionReason" placeholder="반려 사유" />
                  <button type="submit">반려</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
