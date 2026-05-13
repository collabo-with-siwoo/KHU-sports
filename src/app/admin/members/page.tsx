import Link from "next/link";
import { MemberTypeForm } from "./member-type-form";
import { canAccessAdmin, requireAdminPermission } from "@/lib/admin/auth";
import { listAdminMembers, parseMemberListSearchParams, type MemberListFilters } from "@/lib/admin/members";

export const dynamic = "force-dynamic";

type AdminMembersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "-";
}

function pageHref(filters: MemberListFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.userType) params.set("userType", filters.userType);
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(page));

  return `/admin/members?${params.toString()}`;
}

export default async function AdminMembersPage({ searchParams }: AdminMembersPageProps) {
  const admin = await requireAdminPermission("members", "read", "/admin/members");
  const canWrite = canAccessAdmin(admin, "members", "write");
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters = parseMemberListSearchParams(resolvedSearchParams);
  const { members, total, page, pageCount } = await listAdminMembers(filters);

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
            <p className="panel-kicker">M5 Member Management</p>
            <h1>회원 관리</h1>
            <p>
              GENERAL/PLAYER 승인, 회원 상태, 탈퇴 유예 및 익명화 처리를 관리합니다. 목록은 검색과 페이지네이션으로
              제한해 운영 화면이 느려지지 않도록 구성했습니다.
            </p>
          </div>
        </div>

        <form className="admin-notice-form" method="get">
          <label>
            검색
            <input defaultValue={filters.query ?? ""} name="q" placeholder="이름, 아이디, 이메일, 전화번호" />
          </label>
          <label>
            회원 유형
            <select defaultValue={filters.userType ?? ""} name="userType">
              <option value="">전체</option>
              <option value="GENERAL">GENERAL</option>
              <option value="PLAYER">PLAYER</option>
            </select>
          </label>
          <label>
            상태
            <select defaultValue={filters.status ?? ""} name="status">
              <option value="">전체</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DORMANT">DORMANT</option>
              <option value="WITHDRAWN_PENDING">WITHDRAWN_PENDING</option>
              <option value="WITHDRAWN_DELETED">WITHDRAWN_DELETED</option>
            </select>
          </label>
          <button type="submit">검색</button>
        </form>

        <div className="admin-page-heading compact">
          <p>
            총 {total}명 · {page}/{pageCount} 페이지
          </p>
          <div className="profile-actions">
            {page > 1 ? (
              <Link className="button ghost" href={pageHref(filters, page - 1)}>
                이전
              </Link>
            ) : null}
            {page < pageCount ? (
              <Link className="button ghost" href={pageHref(filters, page + 1)}>
                다음
              </Link>
            ) : null}
          </div>
        </div>

        <div className="admin-notice-table">
          <div className="admin-notice-head member-grid">
            <span>상태</span>
            <span>회원</span>
            <span>기록</span>
            <span>운영</span>
          </div>
          {members.length ? (
            members.map((member) => {
              const golfPlayer = member.players[0];
              return (
                <div className="admin-notice-row member-grid" key={member.id}>
                  <span>
                    {member.userType} · {member.status}
                    <br />
                    <small>가입 {formatDate(member.createdAt)}</small>
                  </span>
                  <strong>
                    {member.name} · {member.email}
                    <br />
                    <small>
                      {member.username} · {member.phone}
                    </small>
                  </strong>
                  <time>{golfPlayer ? `${golfPlayer._count.scores}개 스코어` : "선수 프로필 없음"}</time>
                  <div className="profile-actions">
                    <Link className="button ghost" href={`/admin/members/${member.id}`}>
                      상세
                    </Link>
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
                </div>
              );
            })
          ) : (
            <div className="admin-notice-row member-grid">
              <span>-</span>
              <strong>검색 조건에 맞는 회원이 없습니다.</strong>
              <time>-</time>
              <em>-</em>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
