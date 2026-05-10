import Image from "next/image";
import Link from "next/link";
import tournamentPoster from "../../../asset/제27회 경희대학교 총장배 전국 골프대회.png";

const notices = [
  {
    category: "대회 공지",
    title: "제27회 경희대학교 총장배 전국 골프대회 안내",
    date: "2026.05.10"
  },
  {
    category: "서류",
    title: "참가자 안전 서약서 및 개인정보 동의서 제출 안내",
    date: "2026.05.10"
  },
  {
    category: "운영",
    title: "선수 등록은 이메일 접수 후 관리자 승인으로 진행됩니다",
    date: "2026.05.10"
  }
];

const rankings = [
  { rank: 1, name: "김서준", total: 70, diff: "-2" },
  { rank: 2, name: "박도윤", total: 72, diff: "E" },
  { rank: 3, name: "이하린", total: 73, diff: "+1" },
  { rank: 4, name: "정민재", total: 74, diff: "+2" }
];

const quickLinks = [
  {
    title: "대회 공지",
    body: "일정, 장소, 제출 서류, 운영 안내를 확인합니다.",
    href: "/notices"
  },
  {
    title: "대회 결과",
    body: "공개 결과는 순위, 이름, 총타수까지만 표시됩니다.",
    href: "/results"
  },
  {
    title: "내 기록",
    body: "PLAYER 승인 후 본인 상세 스코어카드를 조회합니다.",
    href: "/mypage"
  },
  {
    title: "회원가입",
    body: "아이디 로그인과 약관 동의를 기반으로 일반 회원 계정을 만듭니다.",
    href: "/signup"
  }
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <Link aria-label="KHU Sports home" className="brand" href="/">
          <strong>KHU Sports Golf</strong>
          <span>경희대학교 골프대회</span>
        </Link>
        <nav aria-label="Primary navigation" className="nav">
          <Link href="/notices">공지</Link>
          <Link href="/results">대회 결과</Link>
          <Link href="/terms">약관</Link>
          <Link href="/mypage">마이페이지</Link>
          <Link href="/login">로그인</Link>
          <Link className="admin-link" href="/admin">
            관리자
          </Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="hero-media" aria-hidden="true">
          <Image
            alt=""
            fill
            priority
            src={tournamentPoster}
            sizes="100vw"
          />
          <div className="hero-overlay" />
        </div>

        <div className="home-hero-content">
          <p className="eyebrow">Official Tournament Platform</p>
          <h1>경희대학교 총장배 골프대회</h1>
          <p className="lead">
            공지, 참가 안내, 결과 공개, 본인 기록 조회까지 한곳에서 운영하는
            공식 대회 홈페이지입니다.
          </p>
          <div className="actions" aria-label="Main actions">
            <Link className="button primary" href="/notices">
              최신 공지 보기
            </Link>
            <Link className="button secondary" href="/signup">
              회원가입
            </Link>
          </div>
        </div>

        <div className="hero-scoreboard" aria-label="Upcoming tournament">
          <p className="panel-kicker">Next Tournament</p>
          <strong>제27회 경희대학교 총장배</strong>
          <span>전국 골프대회</span>
          <dl>
            <div>
              <dt>장소</dt>
              <dd>경희대학교 지정 코스</dd>
            </div>
            <div>
              <dt>접수</dt>
              <dd>선수 서류 이메일 접수</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section-grid" aria-label="Tournament information">
        <div className="section-heading">
          <p className="eyebrow">Tournament Desk</p>
          <h2>대회 운영 현황</h2>
        </div>
        <div className="feature-grid">
          {quickLinks.map((item) => (
            <Link className="feature-card" href={item.href} key={item.title}>
              <span>{item.title}</span>
              <p>{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-band" aria-label="Latest notices and results">
        <div className="news-panel">
          <div className="panel-heading">
            <p className="eyebrow">Notice</p>
            <Link href="/notices">전체 보기</Link>
          </div>
          <h2>최신 공지</h2>
          <div className="notice-list">
            {notices.map((notice) => (
              <Link className="notice-row" href="/notices" key={notice.title}>
                <span>{notice.category}</span>
                <strong>{notice.title}</strong>
                <time>{notice.date}</time>
              </Link>
            ))}
          </div>
        </div>

        <div className="ranking-panel">
          <div className="panel-heading">
            <p className="eyebrow">Leaderboard</p>
            <Link href="/results">결과 보기</Link>
          </div>
          <h2>최근 대회 결과</h2>
          <div className="ranking-list">
            {rankings.map((player) => (
              <div className="ranking-row" key={player.rank}>
                <span className="rank">{player.rank}</span>
                <strong>{player.name}</strong>
                <span>{player.diff}</span>
                <b>{player.total}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
