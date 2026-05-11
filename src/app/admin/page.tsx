import Link from "next/link";
import { AdminLoginForm } from "./admin-login-form";
import { adminSignOutAction } from "./actions";
import { canAccessAdmin, getCurrentAdmin } from "@/lib/admin/auth";

const adminModules = [
  {
    label: "01",
    title: "공지 관리",
    body: "대회 공지, 첨부 파일, 공개 일정을 관리합니다.",
    href: "/admin/notices",
    permission: "notices"
  },
  {
    label: "02",
    title: "회원 승인",
    body: "GENERAL 회원을 확인하고 PLAYER 전환을 처리합니다.",
    href: "/admin/members",
    permission: "members"
  },
  {
    label: "03",
    title: "대회 관리",
    body: "대회 일정, 장소, 라운드 정보를 등록하고 공개 결과와 연결합니다.",
    href: "/admin/tournaments",
    permission: "tournaments"
  },
  {
    label: "04",
    title: "스코어 입력",
    body: "수기 입력과 엑셀 업로드 흐름을 연결할 예정입니다.",
    href: "/admin/scores",
    permission: "scores"
  },
  {
    label: "05",
    title: "관리자 관리",
    body: "운영 멤버를 초대하고 메뉴별 권한을 부여합니다.",
    href: "/admin/admins",
    permission: "admins"
  }
] as const;

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const admin = await getCurrentAdmin();
  const params = await searchParams;
  const nextPath = params?.next && params.next.startsWith("/") ? params.next : "/admin";
  const errorMessage =
    params?.error === "forbidden"
      ? "해당 관리자 메뉴에 접근할 권한이 없습니다."
      : "";

  if (admin) {
    return (
      <main className="admin-shell">
        <section className="admin-dashboard-hero" aria-label="관리자 대시보드">
          <div>
            <Link className="admin-home-link" href="/">
              KHU Sports Golf
            </Link>
            <p className="eyebrow">Admin Console</p>
            <h1>{admin.name}님, 운영 콘솔입니다</h1>
            <p>
              관리자 권한에 따라 접근 가능한 메뉴만 표시됩니다. SUPER 관리자는 모든 메뉴에
              접근할 수 있습니다.
            </p>
            {errorMessage ? <p className="form-message error">{errorMessage}</p> : null}
          </div>
          <form action={adminSignOutAction}>
            <button className="admin-secondary-link" type="submit">
              로그아웃
            </button>
          </form>
        </section>

        <section className="admin-module-grid" aria-label="관리자 기능">
          {adminModules
            .filter((module) => canAccessAdmin(admin, module.permission, "read"))
            .map((module) => (
              <Link href={module.href} key={module.label}>
                <article>
                  <span>{module.label}</span>
                  <strong>{module.title}</strong>
                  <p>{module.body}</p>
                </article>
              </Link>
            ))}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <section className="admin-login-hero" aria-label="관리자 로그인">
        <Link className="admin-home-link" href="/">
          KHU Sports Golf
        </Link>

        <div className="admin-copy">
          <p className="eyebrow">Admin Console</p>
          <h1>대회 운영을 위한 관리자 로그인</h1>
          <p>
            공지 등록, 회원 승인, 대회 결과 입력까지 한 화면에서 관리할 수 있도록
            단계별로 기능을 연결하고 있습니다.
          </p>
        </div>

        <AdminLoginForm nextPath={nextPath} />
      </section>

      <section className="admin-module-grid" aria-label="관리자 기능 미리보기">
        {adminModules.map((module) => (
          <Link href={module.href} key={module.label}>
            <article>
              <span>{module.label}</span>
              <strong>{module.title}</strong>
              <p>{module.body}</p>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
