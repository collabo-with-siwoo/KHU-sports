import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { NoticeForm } from "../notice-form";

export const dynamic = "force-dynamic";

export default async function NewAdminNoticePage() {
  await requireAdminPermission("notices", "write", "/admin/notices/new");

  return (
    <main className="admin-workspace">
      <header className="admin-workspace-header">
        <Link className="admin-home-link dark" href="/admin/notices">
          공지사항 관리
        </Link>
        <Link className="admin-secondary-link" href="/">
          사이트 보기
        </Link>
      </header>

      <section className="admin-workspace-main narrow">
        <div className="admin-page-heading">
          <div>
            <p className="panel-kicker">Create Notice</p>
            <h1>새 공지 작성</h1>
            <p>
              대회 안내, 홍보 이미지, 신청 서류를 함께 등록합니다. 홍보 이미지는 공개 R2
              버킷에 저장되어 썸네일로 노출되고, 신청 관련 PDF는 첨부 파일로 공개됩니다.
            </p>
          </div>
        </div>

        <NoticeForm />
      </section>
    </main>
  );
}
