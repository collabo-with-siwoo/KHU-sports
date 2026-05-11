import Link from "next/link";
import { MemberTypeForm } from "./member-type-form";
import { canAccessAdmin, requireAdminPermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const admin = await requireAdminPermission("members", "read", "/admin/members");
  const canWrite = canAccessAdmin(admin, "members", "write");
  const members = await prisma.user.findMany({
    include: {
      players: {
        where: {
          sport: { code: "GOLF" }
        },
        select: {
          id: true,
          affiliation: true,
          _count: {
            select: { scores: true }
          }
        }
      }
    },
    orderBy: [{ userType: "desc" }, { createdAt: "desc" }]
  });

  return (
    <main className="admin-workspace">
      <header className="admin-workspace-header">
        <Link className="admin-home-link dark" href="/admin">
          KHU Sports Admin
        </Link>
        <Link className="admin-secondary-link" href="/mypage">
          마이페이지 보기
        </Link>
      </header>

      <section className="admin-workspace-main">
        <div className="admin-page-heading">
          <div>
            <p className="panel-kicker">M3 Member Approval</p>
            <h1>회원 승인</h1>
            <p>
              일반 회원을 PLAYER로 전환하고 골프 선수 프로필을 생성합니다. 전환 이후
              스코어 입력과 마이페이지 기록 아카이브에 연결됩니다.
            </p>
          </div>
        </div>

        <div className="admin-notice-table">
          <div className="admin-notice-head member-grid">
            <span>상태</span>
            <span>회원</span>
            <span>기록</span>
            <span>승인</span>
          </div>
          {members.map((member) => {
            const golfPlayer = member.players[0];
            return (
              <div className="admin-notice-row member-grid" key={member.id}>
                <span>
                  {member.userType} · {member.status}
                </span>
                <strong>
                  {member.name} · {member.email}
                </strong>
                <time>{golfPlayer ? `${golfPlayer._count.scores}개 스코어` : "선수 프로필 없음"}</time>
                {canWrite ? (
                  <MemberTypeForm
                    defaultAffiliation={golfPlayer?.affiliation ?? ""}
                    defaultUserType={member.userType}
                    userId={member.id}
                  />
                ) : (
                  <em>{golfPlayer?.affiliation ?? "-"}</em>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
