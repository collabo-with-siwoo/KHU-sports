import Link from "next/link";
import { TournamentForm } from "./tournament-form";
import { updateTournamentCourseAction } from "./actions";
import { requireAdminPermission } from "@/lib/admin/auth";
import { listAdminTournaments } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage() {
  await requireAdminPermission("tournaments", "read", "/admin/tournaments");
  const tournaments = await listAdminTournaments();

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
            <p className="panel-kicker">M4 Tournament</p>
            <h1>대회 관리</h1>
            <p>골프 대회를 등록하고, 대회별 18홀 파 기준을 관리합니다.</p>
          </div>
        </div>

        <TournamentForm />

        <div className="admin-notice-table">
          <div className="admin-notice-head tournament-grid">
            <span>종목</span>
            <span>대회명</span>
            <span>기간</span>
            <span>스코어</span>
          </div>
          {tournaments.map((tournament) => (
            <div className="admin-tournament-row" key={tournament.id}>
              <div className="admin-notice-row tournament-grid">
                <span>{tournament.sportName}</span>
                <strong>{tournament.name}</strong>
                <time dateTime={tournament.startDate}>
                  {tournament.startDate} ~ {tournament.endDate}
                </time>
                <em>
                  <Link href={`/admin/tournaments/${tournament.id}/scores`}>{tournament.scoreCount}건 보기</Link>
                </em>
              </div>
              <details className="admin-course-details">
                <summary>
                  홀별 파 설정 수정 <span>현재 Par {tournament.totalPar}</span>
                </summary>
                <form action={updateTournamentCourseAction} className="admin-course-par-form">
                  <input name="tournamentId" type="hidden" value={tournament.id} />
                  <div className="admin-hole-pars compact">
                    {tournament.holePars.map((par, index) => (
                      <label key={index}>
                        {index + 1}H
                        <input defaultValue={par} max="6" min="3" name={`holePar${index + 1}`} type="number" />
                      </label>
                    ))}
                  </div>
                  <button type="submit">파 설정 저장</button>
                </form>
              </details>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
