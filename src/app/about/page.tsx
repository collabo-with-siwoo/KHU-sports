import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

const heroUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC1AWWs8FEyFx31sSOG-AP7Y_Vu-PfrUdJPPeHErDTXqEM_f2gpYQQsC7swnWFOkLxghN5vvwJ7km__bMzwWjtca5E0AdTwRPlVT1ordq-RqDRdA8g8hI1lw-t-idqokTQbbaydUynXbbk2zXCqLPPlA_BlAfcRyGMpoI6CJ7h-vHO9o2WrAizCPMQnN9Tv2GIujQB5KObneFQynkx_HUfs_HBDCI6d2Fknzf1VA63ZQL99EVkxBLTNmcPAVO94W_7GkRrf4PsFn0P4";

const features = [
  {
    icon: "info",
    title: "대회 정보 확인",
    body: "대회 일정, 장소, 코스 정보, 경기 규정 등 경희대학교 총장배 골프대회의 모든 상세 정보를 한눈에 확인하세요.",
    link: { text: "자세히 보기 →", href: "/schedule" },
    highlight: false
  },
  {
    icon: "edit_note",
    title: "참가 신청",
    body: "로그인 후 참가할 대회를 선택하고 신청서를 작성하면 관리자 승인 후 대회에 참가할 수 있습니다.",
    link: { text: "지금 신청하기", href: "/login" },
    highlight: true
  },
  {
    icon: "history",
    title: "참가 이력 조회",
    body: "과거 출전한 대회 기록과 라운드별 스코어, 성적 변화 등 개인의 모든 골프 대회 이력을 관리합니다.",
    link: { text: "내역 확인 →", href: "/mypage" },
    highlight: false
  }
];

const capabilities = [
  { icon: "sports_golf", title: "실시간 경기결과", desc: "FULL LEADERBOARD와 SCORECARD로 라운드별·홀별 스코어를 실시간 확인" },
  { icon: "event_note", title: "대회 정보", desc: "스폰서, 일정, 장소, 전장거리, 경기방식 등 대회별 상세 정보 제공" },
  { icon: "campaign", title: "공지사항", desc: "대회 관련 규정 변경, 일정 업데이트, 긴급 공지를 카드형 피드로 확인" },
  { icon: "person", title: "마이페이지", desc: "본인의 상세 스코어카드, 참가 이력, 회원 정보를 한곳에서 관리" },
  { icon: "admin_panel_settings", title: "어드민 운영", desc: "스코어 입력, 회원 관리, 약관 발행 등 대회 운영 전반을 체계적으로 관리" },
  { icon: "security", title: "개인정보 보호", desc: "상세 스코어카드는 본인만 조회 가능, 탈퇴 시 개인정보 삭제·스코어 익명화" }
];

const stats = [
  { value: "27회", label: "역사와 전통" },
  { value: "120+", label: "매년 참가 선수" },
  { value: "54홀", label: "스트로크플레이" },
  { value: "6,400yds", label: "코스 전장" }
];

export default function AboutPage() {
  return (
    <main className="home-app">
      <Header currentPath="/about" />

      {/* Hero Banner */}
      <section
        className="about-hero"
        style={{ backgroundImage: `url("${heroUrl}")` }}
      >
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <p className="about-hero-label">About KHU Sports</p>
          <h1>경희대학교 골프대회의<br />모든 것을 한 곳에서</h1>
          <p>
            대회 정보 확인부터 참가 신청, 실시간 경기결과 조회, 개인 스코어 관리까지 —<br />
            KHU Sports는 경희대학교 총장배 골프대회를 위한 통합 플랫폼입니다.
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="about-features">
        {features.map((f) => (
          <article className={`about-feature-card${f.highlight ? " highlight" : ""}`} key={f.title}>
            <div className={`about-feature-icon${f.highlight ? " gold" : ""}`}>
              <span className="material-symbols-outlined">{f.icon}</span>
            </div>
            <h2>{f.title}</h2>
            <p>{f.body}</p>
            {f.highlight ? (
              <a className="about-cta-btn" href={f.link.href}>{f.link.text}</a>
            ) : (
              <Link className="about-feature-link" href={f.link.href}>{f.link.text}</Link>
            )}
          </article>
        ))}
      </section>

      {/* What We Offer */}
      <section className="about-section">
        <div className="about-section-header">
          <p className="stitch-label">What We Offer</p>
          <h2>KHU Sports에서 할 수 있는 것들</h2>
          <p>대회 참가자와 운영진 모두를 위한 기능을 제공합니다.</p>
        </div>
        <div className="about-capability-grid">
          {capabilities.map((c) => (
            <div className="about-capability-card" key={c.title}>
              <span className="material-symbols-outlined">{c.icon}</span>
              <strong>{c.title}</strong>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="about-section">
        <div className="about-section-header">
          <p className="stitch-label">Tournament at a Glance</p>
          <h2>경희대학교 총장배 골프대회</h2>
        </div>
        <div className="about-overview-grid">
          {stats.map((s) => (
            <div className="about-overview-card" key={s.label}>
              <strong>{s.value}</strong>
              <small>{s.label}</small>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <h2>지금 시작하세요</h2>
        <p>회원가입 후 로그인하여 참가 신청을 완료하면 대회에 참가할 수 있습니다.</p>
        <div className="about-cta-actions">
          <Link className="home-btn primary" href="/signup">회원가입</Link>
          <Link className="home-btn outline" href="/login">참가 신청하기</Link>
        </div>
      </section>

      <Footer />

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {mobileNavItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
