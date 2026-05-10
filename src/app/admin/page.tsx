import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="admin-shell">
      <section className="admin-visual" aria-label="Admin login">
        <Link className="admin-back" href="/">
          KHU Sports Golf
        </Link>
        <div className="admin-copy">
          <p className="eyebrow">Admin Console</p>
          <h1 className="admin-title">대회 운영을 위한 관리자 로그인</h1>
          <p>
            공지 등록, 회원 승인, 대회 결과 입력까지 한 화면에서 관리할 수
            있도록 설계 중입니다.
          </p>
        </div>

        <div className="login-panel">
          <div className="login-heading">
            <p>Secure Access</p>
            <strong>관리자 로그인</strong>
          </div>
          <label>
            이메일
            <input placeholder="admin@example.com" type="email" />
          </label>
          <label>
            비밀번호
            <input placeholder="••••••••" type="password" />
          </label>
          <button type="button">로그인</button>
          <div className="login-meta">
            <span>Supabase Auth 연동 예정</span>
            <span>RBAC 보호</span>
          </div>
        </div>
      </section>

      <section className="admin-preview" aria-label="Admin modules">
        <div>
          <span>01</span>
          <strong>공지 관리</strong>
          <p>Tiptap 에디터와 R2 업로드를 연결합니다.</p>
        </div>
        <div>
          <span>02</span>
          <strong>회원 승인</strong>
          <p>GENERAL 회원을 PLAYER로 전환합니다.</p>
        </div>
        <div>
          <span>03</span>
          <strong>스코어 입력</strong>
          <p>수기 입력과 엑셀 업로드를 병행합니다.</p>
        </div>
      </section>
    </main>
  );
}
