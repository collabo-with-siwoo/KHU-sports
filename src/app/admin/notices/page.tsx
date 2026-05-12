import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { listAdminNotices } from "@/lib/notices";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  await requireAdminPermission("notices", "read", "/admin/notices");
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
              대회 공지, 홍보 이미지, 신청 서류 첨부 파일을 관리합니다. 새 공지 작성에서
              `asset` 폴더의 홍보 이미지와 `reference` 폴더의 신청 관련 PDF를 업로드할 수 있습니다.
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
            <span>첨부</span>
          </div>
          {notices.map((notice) => (
            <Link className="admin-notice-row" href={`/notices/${notice.id}`} key={notice.id}>
              <span>{notice.category}</span>
              <strong>{notice.title}</strong>
              <time dateTime={notice.publishedAt}>{notice.publishedLabel}</time>
              <em>{notice.attachments.length ? `${notice.attachments.length}개` : "없음"}</em>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
