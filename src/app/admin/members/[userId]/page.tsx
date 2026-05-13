import Link from "next/link";
import { notFound } from "next/navigation";
import {
  finalizeMemberWithdrawalAction,
  recoverMemberAction,
  requestAdminStatusChangeAction
} from "../actions";
import { MemberTypeForm } from "../member-type-form";
import { canAccessAdmin, requireAdminPermission } from "@/lib/admin/auth";
import { getAdminMemberDetail } from "@/lib/admin/members";

export const dynamic = "force-dynamic";

type AdminMemberDetailPageProps = {
  params: Promise<{ userId: string }>;
};

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "-";
}

function scoreTotal(scoreData: unknown) {
  if (!scoreData || typeof scoreData !== "object" || Array.isArray(scoreData)) {
    return "-";
  }

  const total = (scoreData as { total?: unknown; roundTotal?: unknown }).total ?? (scoreData as { roundTotal?: unknown }).roundTotal;
  return typeof total === "number" ? String(total) : "-";
}

function StatusButton({ userId, status, label }: { userId: string; status: string; label: string }) {
  return (
    <form action={requestAdminStatusChangeAction}>
      <input name="userId" type="hidden" value={userId} />
      <input name="status" type="hidden" value={status} />
      <button className="button ghost" type="submit">
        {label}
      </button>
    </form>
  );
}

export default async function AdminMemberDetailPage({ params }: AdminMemberDetailPageProps) {
  const { userId } = await params;
  const admin = await requireAdminPermission("members", "read", `/admin/members/${userId}`);
  const canWrite = canAccessAdmin(admin, "members", "write");
  const member = await getAdminMemberDetail(userId);

  if (!member) {
    notFound();
  }

  const golfPlayer = member.players[0];

  return (
    <main className="admin-workspace">
      <header className="admin-workspace-header">
        <Link className="admin-home-link dark" href="/admin/members">
          회원 목록
        </Link>
        <Link className="admin-secondary-link" href="/admin">
          KHU Sports Admin
        </Link>
      </header>

      <section className="admin-workspace-main">
        <div className="admin-page-heading">
          <div>
            <p className="panel-kicker">Member Detail</p>
            <h1>{member.name}</h1>
            <p>
              {member.username} · {member.email} · {member.userType} · {member.status}
            </p>
          </div>
        </div>

        <section className="profile-preview">
          <div>
            <span>{member.status}</span>
            <strong>회원 정보</strong>
            <p>
              전화번호 {member.phone} / 생년월일 {formatDate(member.birthDate)} / 성별 {member.gender}
            </p>
            <p>
              주소 {member.address ?? "-"} / 가입 {formatDate(member.createdAt)} / 마지막 로그인{" "}
              {formatDate(member.lastLoginAt)}
            </p>
            <p>탈퇴 요청일 {formatDate(member.withdrawnAt)}</p>
          </div>
        </section>

        <section className="profile-preview">
          <div>
            <span>{member.userType}</span>
            <strong>선수 프로필</strong>
            <p>
              {golfPlayer
                ? `${golfPlayer.name} · ${golfPlayer.affiliation ?? "소속 없음"} · ${golfPlayer._count.scores}개 스코어`
                : "아직 GOLF 선수 프로필이 없습니다."}
            </p>
            <p>{golfPlayer?.anonymized ? "익명화된 선수 기록입니다." : "활성 선수 기록입니다."}</p>
          </div>
          {canWrite && member.status !== "WITHDRAWN_DELETED" ? (
            <MemberTypeForm
              defaultAffiliation={golfPlayer?.affiliation ?? ""}
              defaultUserType={member.userType}
              userId={member.id}
            />
          ) : null}
        </section>

        {canWrite ? (
          <section className="profile-preview">
            <div>
              <span>Lifecycle</span>
              <strong>회원 상태 운영</strong>
              <p>탈퇴 확정은 개인정보를 마스킹하고 Player 기록을 익명화합니다.</p>
            </div>
            <div className="profile-actions">
              {member.status !== "ACTIVE" && member.status !== "WITHDRAWN_DELETED" ? (
                <StatusButton label="ACTIVE 전환" status="ACTIVE" userId={member.id} />
              ) : null}
              {member.status === "ACTIVE" ? <StatusButton label="DORMANT 처리" status="DORMANT" userId={member.id} /> : null}
              {member.status === "ACTIVE" || member.status === "DORMANT" ? (
                <StatusButton label="탈퇴 유예 처리" status="WITHDRAWN_PENDING" userId={member.id} />
              ) : null}
              {member.status === "WITHDRAWN_PENDING" ? (
                <form action={recoverMemberAction}>
                  <input name="userId" type="hidden" value={member.id} />
                  <button className="button ghost" type="submit">
                    탈퇴 복구
                  </button>
                </form>
              ) : null}
              {member.status === "WITHDRAWN_PENDING" ? (
                <form action={finalizeMemberWithdrawalAction}>
                  <input name="userId" type="hidden" value={member.id} />
                  <button className="button primary" type="submit">
                    탈퇴 확정 및 익명화
                  </button>
                </form>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="admin-notice-table">
          <div className="admin-notice-head admin-tournament-score-grid">
            <span>대회</span>
            <span>라운드</span>
            <span>합계</span>
            <span>순위</span>
          </div>
          {golfPlayer?.scores.length ? (
            golfPlayer.scores.map((score) => (
              <div className="admin-notice-row admin-tournament-score-grid" key={score.id}>
                <strong>{score.tournament.name}</strong>
                <span>{score.round}R</span>
                <time>{scoreTotal(score.scoreData)}</time>
                <em>{score.rank ? `${score.rank}위` : "-"}</em>
              </div>
            ))
          ) : (
            <div className="admin-notice-row admin-tournament-score-grid">
              <strong>최근 스코어가 없습니다.</strong>
              <span>-</span>
              <time>-</time>
              <em>-</em>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
