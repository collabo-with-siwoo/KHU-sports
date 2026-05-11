import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { noticeCategories } from "@/lib/notices";

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
              관리자 인증과 쓰기 권한은 확인되었습니다. 실제 저장, Tiptap 에디터, R2 업로드는
              다음 공지 작성 단계에서 연결합니다.
            </p>
          </div>
        </div>

        <form className="admin-notice-form">
          <label>
            분류
            <select defaultValue="대회 안내" disabled>
              {noticeCategories
                .filter((category) => category !== "전체")
                .map((category) => (
                  <option key={category}>{category}</option>
                ))}
            </select>
          </label>
          <label>
            제목
            <input disabled placeholder="공지 제목을 입력하세요" />
          </label>
          <label>
            본문
            <textarea disabled placeholder="공지 본문을 입력하세요" rows={10} />
          </label>
          <label>
            첨부 파일
            <input disabled type="file" />
          </label>
          <button disabled type="button">
            Tiptap/R2 저장 액션 연결 후 저장 가능
          </button>
        </form>
      </section>
    </main>
  );
}
