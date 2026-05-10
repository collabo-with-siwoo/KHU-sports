import Link from "next/link";

const heroBackgroundUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnJy_JZ6lVjmj8zcdfKJ8MaYPGYWmtm_8ROeOcVi_e9iyWDVC3ix9foJTbKfjRITfUdrAr3wMS0rMcwKqqiiIfxh949u524oakkI9G90LFJ6R7mJLPfEGydifMsbILYrf5ZFec_KcZcjm6X1-wBM4tMrETYEY9vhap6DfW1YZyri5M7wQsY4g4-GUYWU8ldKgHXM1RU3W9j6ns5bDDkNrPZ8C7lSwkIMdVvrrKXspjnjXGW50tXrzyEhdsOzs1W_QXtvcB29DiVWff";

const navItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "리더보드", icon: "leaderboard", href: "/results" },
  { label: "공지사항", icon: "campaign", href: "/notices" },
  { label: "내 기록", icon: "history_edu", href: "/mypage" }
];

const deskItems = [
  {
    title: "대회 공지",
    body: "일정, 장소, 제출 서류, 운영 안내를 확인합니다.",
    href: "/notices"
  },
  {
    title: "대회 결과",
    body: "공개 결과는 순위, 이름, 총타수까지만 표시합니다.",
    href: "/results"
  },
  {
    title: "내 기록",
    body: "PLAYER 승인 후 본인 상세 스코어카드를 조회합니다.",
    href: "/mypage"
  },
  {
    title: "회원가입",
    body: "가입 직후 GENERAL 회원으로 시작합니다.",
    href: "/signup"
  }
];

const notices = [
  ["대회", "제27회 경희대학교 총장배 전국 골프대회 안내", "2026.05.10"],
  ["서류", "참가 신청 서약서 및 개인정보 동의서 제출 안내", "2026.05.10"],
  ["운영", "선수 등록은 이메일 접수 후 관리자 승인으로 진행됩니다", "2026.05.10"]
];

const leaderboard = [
  { rank: 1, name: "김서준", diff: "-2", total: 70 },
  { rank: 2, name: "박도윤", diff: "E", total: 72 },
  { rank: 3, name: "이하린", diff: "+1", total: 73 },
  { rank: 4, name: "정민재", diff: "+2", total: 74 }
];

export default function HomePage() {
  return (
    <main className="stitch-app">
      <header className="stitch-topbar">
        <Link className="stitch-brand" href="/">
          <span>KHU</span>
          <strong>KHU 경희대학교 총장배</strong>
        </Link>
        <nav className="stitch-desktop-nav" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link className={item.href === "/" ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/admin">관리자</Link>
        </nav>
        <Link aria-label="로그인" className="stitch-icon-button" href="/login">
          <span className="material-symbols-outlined">account_circle</span>
        </Link>
      </header>

      <div className="stitch-canvas">
        <section
          className="stitch-hero"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(1, 38, 31, 0.78), rgba(1, 38, 31, 0.52)), url("${heroBackgroundUrl}")`
          }}
        >
          <div className="stitch-hero-content">
            <p className="stitch-label">공식 대회 운영 플랫폼</p>
            <h1>경희대학교 총장배 골프대회</h1>
            <p>
              공지, 참가 안내, 결과 공개, 본인 기록 조회까지 한곳에서 확인하는
              공식 대회 홈페이지입니다.
            </p>
            <div className="stitch-actions">
              <Link className="stitch-button primary" href="/notices">
                최신 공지 보기
              </Link>
              <Link className="stitch-button outline" href="/signup">
                회원가입
              </Link>
            </div>
          </div>

          <aside className="stitch-next-card" aria-label="다음 대회 안내">
            <p>다음 대회 안내</p>
            <h2>제27회 경희대학교 총장배</h2>
            <span>전국 골프대회</span>
            <dl>
              <div>
                <dt>장소</dt>
                <dd>경희대학교 지정 코스</dd>
              </div>
              <div>
                <dt>접수</dt>
                <dd>이메일 서류 접수</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="stitch-section">
          <div className="stitch-section-heading">
            <p className="stitch-label">운영 데스크</p>
            <h2>대회 운영 현황</h2>
          </div>
          <div className="stitch-bento-grid">
            {deskItems.map((item) => (
              <Link className="stitch-bento-card" href={item.href} key={item.title}>
                <i />
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="stitch-two-column">
          <article className="stitch-panel">
            <div className="stitch-panel-heading">
              <div>
                <p className="stitch-label">공지사항</p>
                <h2>최신 공지</h2>
              </div>
              <Link href="/notices">전체 보기</Link>
            </div>
            <div className="stitch-notice-list">
              {notices.map(([category, title, date]) => (
                <Link href="/notices" key={title}>
                  <span>{category}</span>
                  <strong>{title}</strong>
                  <time>{date}</time>
                </Link>
              ))}
            </div>
          </article>

          <article className="stitch-panel">
            <div className="stitch-panel-heading">
              <div>
                <p className="stitch-label">리더보드</p>
                <h2>최근 대회 결과</h2>
              </div>
              <Link href="/results">결과 보기</Link>
            </div>
            <div className="stitch-mini-board">
              {leaderboard.map((player) => (
                <div key={player.rank}>
                  <span>{player.rank}</span>
                  <strong>{player.name}</strong>
                  <em>{player.diff}</em>
                  <b>{player.total}</b>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {navItems.map((item) => (
          <Link className={item.href === "/" ? "active" : ""} href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
