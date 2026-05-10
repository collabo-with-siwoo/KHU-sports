import Link from "next/link";
import { listAdminNotices } from "@/lib/notices";

export const revalidate = 60;

export default async function AdminNoticesPage() {
  const notices = await listAdminNotices();

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
            <p className="panel-kicker">M2 Notice System</p>
            <h1>공지사항 관리</h1>
            <p>
              Supabase 공지 데이터를 기준으로 공개 상태와 첨부 파일을 관리하는 화면입니다.
              저장 액션은 관리자 인증/RBAC가 붙는 M3에서 활성화합니다.
            </p>
          </div>
          <Link className="admin-primary-link" href="/admin/notices/new">
            <span className="material-symbols-outlined">add</span>
            새 공지 작성
          </Link>
        </div>

        <div className="admin-notice-table">
          <div className="admin-notice-head">
            <span>분류</span>
            <span>제목</span>
            <span>공개일</span>
            <span>상태</span>
          </div>
          {notices.map((notice) => (
            <Link className="admin-notice-row" href={`/notices/${notice.id}`} key={notice.id}>
              <span>{notice.category}</span>
              <strong>{notice.title}</strong>
              <time dateTime={notice.publishedAt}>{notice.publishedLabel}</time>
              <em>{notice.publishedAt ? "공개" : "초안"}</em>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
