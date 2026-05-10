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
    body: "대회 일정, 코스 정보, 경기 규정 등 토너먼트 진행에 필요한 모든 상세 정보를 확인하실 수 있습니다.",
    link: { text: "자세히 보기 →", href: "/schedule" },
    highlight: false
  },
  {
    icon: "edit_note",
    title: "참가 신청",
    body: "이메일 접수를 통해 간편하게 대회 참가 접수를 진행하세요. 선수 등록 서류 제출 후 관리자 승인을 거쳐 PLAYER로 전환됩니다.",
    link: { text: "지금 신청하기", href: "mailto:khusports2026@gmail.com" },
    highlight: true
  },
  {
    icon: "history",
    title: "참가 이력 조회",
    body: "과거 출전했던 대회 기록과 성적, 핸디캡 변화 등 개인의 모든 골프 대회 이력을 관리합니다.",
    link: { text: "내역 확인 →", href: "/mypage" },
    highlight: false
  }
];

const timeline = [
  { step: "01", title: "회원가입", desc: "아이디, 이름, 생년월일, 연락처 등 기본 정보를 입력하고 약관에 동의합니다." },
  { step: "02", title: "선수 등록 서류 제출", desc: "참가 서약서 및 개인정보 동의서를 이메일(khusports2026@gmail.com)로 접수합니다." },
  { step: "03", title: "관리자 승인", desc: "운영국에서 서류를 검토한 후 GENERAL → PLAYER로 회원 유형을 전환합니다." },
  { step: "04", title: "대회 출전", desc: "승인 완료 후 대회에 출전하고, 경기 결과는 본인 마이페이지에서 확인할 수 있습니다." }
];

const faqs = [
  { q: "참가 자격은 어떻게 되나요?", a: "경희대학교 재학생, 졸업생, 교직원 및 초청 게스트가 참가할 수 있습니다. 상세 자격 요건은 각 대회 요강을 참고하세요." },
  { q: "대회 결과는 어디서 확인하나요?", a: "경기결과 페이지에서 순위, 이름, 총타수를 확인할 수 있습니다. 상세 스코어카드는 본인만 조회 가능합니다." },
  { q: "선수 등록 후 승인까지 얼마나 걸리나요?", a: "서류 접수 후 통상 3~5 영업일 내에 승인됩니다. 승인 결과는 등록된 이메일로 안내드립니다." },
  { q: "회원 탈퇴 시 기록은 어떻게 되나요?", a: "탈퇴 신청 후 30일 유예 기간이 적용되며, 이후 개인정보는 삭제됩니다. 스코어 기록은 익명화되어 보존됩니다." }
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
          <h1>경희대학교 총장배 골프대회</h1>
          <p>
            경희대학교의 스포츠 정신과 골프의 전통이 만나는 대학 골프 토너먼트.<br />
            선수 등록부터 경기 결과 조회까지, KHU Sports가 함께합니다.
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

      {/* 참가 절차 Timeline */}
      <section className="about-section">
        <div className="about-section-header">
          <p className="stitch-label">How to Participate</p>
          <h2>참가 절차</h2>
          <p>간단한 4단계로 대회에 참가하세요.</p>
        </div>
        <div className="about-timeline">
          {timeline.map((t) => (
            <div className="about-timeline-step" key={t.step}>
              <span className="about-step-num">{t.step}</span>
              <div>
                <strong>{t.title}</strong>
                <p>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 대회 개요 */}
      <section className="about-section">
        <div className="about-section-header">
          <p className="stitch-label">Tournament Overview</p>
          <h2>대회 개요</h2>
        </div>
        <div className="about-overview-grid">
          <div className="about-overview-card">
            <span className="material-symbols-outlined">emoji_events</span>
            <strong>27회</strong>
            <small>역사와 전통</small>
          </div>
          <div className="about-overview-card">
            <span className="material-symbols-outlined">groups</span>
            <strong>120+명</strong>
            <small>매년 참가 선수</small>
          </div>
          <div className="about-overview-card">
            <span className="material-symbols-outlined">sports_golf</span>
            <strong>54홀</strong>
            <small>스트로크플레이</small>
          </div>
          <div className="about-overview-card">
            <span className="material-symbols-outlined">school</span>
            <strong>경희대학교</strong>
            <small>주최 · 총장배</small>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="about-section">
        <div className="about-section-header">
          <p className="stitch-label">FAQ</p>
          <h2>자주 묻는 질문</h2>
        </div>
        <div className="about-faq-list">
          {faqs.map((faq) => (
            <details className="about-faq-item" key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <h2>대회 참가를 준비하세요</h2>
        <p>선수 등록 서류를 이메일로 접수하면, 운영국 확인 후 PLAYER로 전환됩니다.</p>
        <div className="about-cta-actions">
          <Link className="home-btn primary" href="/signup">회원가입</Link>
          <a className="home-btn outline" href="mailto:khusports2026@gmail.com">선수 등록 문의</a>
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
