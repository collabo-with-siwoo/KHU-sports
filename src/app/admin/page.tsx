import Link from "next/link";

const adminModules = [
  {
    label: "01",
    title: "공지 관리",
    body: "대회 공지, 첨부 파일, 공개 일정을 관리합니다.",
    href: "/admin/notices"
  },
  {
    label: "02",
    title: "회원 승인",
    body: "GENERAL 회원을 확인하고 PLAYER 전환을 처리합니다.",
    href: "/admin"
  },
  {
    label: "03",
    title: "스코어 입력",
    body: "수기 입력과 엑셀 업로드 흐름을 연결할 예정입니다.",
    href: "/admin"
  }
];

export default function AdminPage() {
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

        <form className="admin-login-card">
          <div>
            <p className="panel-kicker">Secure Access</p>
            <strong>관리자 로그인</strong>
          </div>
          <label>
            이메일
            <input autoComplete="email" placeholder="admin@example.com" type="email" />
          </label>
          <label>
            비밀번호
            <input
              autoComplete="current-password"
              placeholder="비밀번호"
              type="password"
            />
          </label>
          <button type="button">로그인</button>
          <p className="admin-note">인증된 관리자만 접근할 수 있도록 M3에서 연결합니다.</p>
        </form>
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
