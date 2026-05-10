import Link from "next/link";
import { noticeCategories } from "@/lib/notices";

export default function NewAdminNoticePage() {
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
              M2에서는 공지 작성 화면 구조와 데이터 계약을 먼저 고정합니다. 실제 저장,
              Tiptap 에디터, R2 업로드는 관리자 인증이 연결된 뒤 활성화합니다.
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
            M3 관리자 인증 연결 후 저장 가능
          </button>
        </form>
      </section>
    </main>
  );
}
