import Link from "next/link";
import { TournamentForm } from "./tournament-form";
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
            <p>골프 대회를 등록하고 대회별 스코어 검색/검수 화면으로 이동합니다.</p>
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
            <div className="admin-notice-row tournament-grid" key={tournament.id}>
              <span>{tournament.sportName}</span>
              <strong>{tournament.name}</strong>
              <time dateTime={tournament.startDate}>
                {tournament.startDate} ~ {tournament.endDate}
              </time>
              <em>
                <Link href={`/admin/tournaments/${tournament.id}/scores`}>{tournament.scoreCount}건 보기</Link>
              </em>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
