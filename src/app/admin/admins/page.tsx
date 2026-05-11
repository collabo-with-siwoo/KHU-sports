import Link from "next/link";
import { AdminInviteForm } from "./admin-invite-form";
import { canAccessAdmin, requireAdminPermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function permissionSummary(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "-";
  }

  return Object.entries(value)
    .filter(([, permission]) => {
      if (!permission || typeof permission !== "object" || Array.isArray(permission)) {
        return false;
      }

      return Boolean((permission as { read?: boolean; write?: boolean }).read);
    })
    .map(([key, permission]) => {
      const writable = Boolean((permission as { write?: boolean }).write);
      return `${key}${writable ? " W" : " R"}`;
    })
    .join(", ");
}

export default async function AdminAdminsPage() {
  const admin = await requireAdminPermission("admins", "read", "/admin/admins");
  const canWrite = canAccessAdmin(admin, "admins", "write");
  const admins = await prisma.adminUser.findMany({
    orderBy: [{ role: "desc" }, { createdAt: "desc" }]
  });

  return (
    <main className="admin-workspace">
      <header className="admin-workspace-header">
        <Link className="admin-home-link dark" href="/admin">
          KHU Sports Admin
        </Link>
        <Link className="admin-secondary-link" href="/">
          사이트 보기
        </Link>
      </header>

      <section className="admin-workspace-main">
        <div className="admin-page-heading">
          <div>
            <p className="panel-kicker">M3 Admin RBAC</p>
            <h1>관리자 관리</h1>
            <p>
              운영 멤버의 관리자 프로필을 만들고 메뉴별 권한을 부여합니다. Supabase Auth
              계정은 같은 이메일로 준비되어야 로그인할 수 있습니다.
            </p>
          </div>
        </div>

        {canWrite ? <AdminInviteForm /> : null}

        <div className="admin-notice-table">
          <div className="admin-notice-head admin-grid">
            <span>상태</span>
            <span>관리자</span>
            <span>역할</span>
            <span>권한</span>
          </div>
          {admins.map((item) => (
            <div className="admin-notice-row admin-grid" key={item.id}>
              <span>{item.status}</span>
              <strong>
                {item.name} · {item.email}
              </strong>
              <time>{item.role}</time>
              <em>{item.role === "SUPER" ? "전체 권한" : permissionSummary(item.permissions)}</em>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
