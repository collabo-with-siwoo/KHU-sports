import Link from "next/link";
import { ScoreForm } from "./score-form";
import { requireAdminPermission } from "@/lib/admin/auth";
import { listAdminScoreRows, listAdminTournaments } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function AdminScoresPage() {
  await requireAdminPermission("scores", "read", "/admin/scores");
  const [tournaments, scores] = await Promise.all([
    listAdminTournaments(),
    listAdminScoreRows()
  ]);

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
              기존 회원 이메일을 기준으로 선수 프로필을 만들고 라운드별 전반/후반/총타수를
              저장합니다. 공개 페이지에는 순위, 이름, 총타수까지만 노출됩니다.
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
          </div>
          {scores.map((score) => (
            <div className="admin-notice-row score-grid" key={score.id}>
              <span>{score.tournamentName}</span>
              <strong>
                {score.playerName} · {score.affiliation}
              </strong>
              <time>{score.round}R</time>
              <em>
                {score.total}타{score.rank ? ` · ${score.rank}위` : ""}
              </em>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

