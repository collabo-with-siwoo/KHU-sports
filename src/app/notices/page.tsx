import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

const filters = ["전체", "규정 및 규칙", "일정 변경", "긴급 공지", "선수 장비"];

const notices = [
  {
    category: "긴급",
    date: "2026년 10월 12일 · 오전 08:30",
    title: "기상 프로토콜 수정 안내: 2라운드 지연 가능성",
    body: "악천후 예보에 따라 대회 위원회는 경기 2라운드를 위한 업데이트된 기상 프로토콜을 발표했습니다. 지정된 대피소 구역 및 대피 경로를 반드시 확인하시기 바랍니다.",
    featured: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1AWWs8FEyFx31sSOG-AP7Y_Vu-PfrUdJPPeHErDTXqEM_f2gpYQQsC7swnWFOkLxghN5vvwJ7km__bMzwWjtca5E0AdTwRPlVT1ordq-RqDRdA8g8hI1lw-t-idqokTQbbaydUynXbbk2zXCqLPPlA_BlAfcRyGMpoI6CJ7h-vHO9o2WrAizCPMQnN9Tv2GIujQB5KObneFQynkx_HUfs_HBDCI6d2Fknzf1VA63ZQL99EVkxBLTNmcPAVO94W_7GkRrf4PsFn0P4",
    link: { text: "전체 공지 읽기 →", href: "#" }
  },
  {
    category: "규정",
    date: "2026년 10월 11일",
    title: "금지 장비 업데이트",
    body: "본 시리즈의 공인 드라이버 리스트 및 비공인 거리 측정 장치에 대한 유의사항입니다.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuFw25q4FMGCj_FSURyPmFVb3JxQ-weBC3NW4tGdogCmPSSEhcRZbDLaZv-tv95rwQbFUMMYeb1xjZD6WR-KTB756oZBhOdhwsyAlhk-doN-FPndTNVyd-Pni9lGq81QgoO5dBlg-5ojQLIZeCW5LLAtQMeLYCBPNoTQfTApeqJLxENsarmZXeKNrON5SHe5QsX4oijUQF6LxLHzBDY650o5Uu9rDY_zrBh-lUdSCTz1rXl75XfUv2bM2KNSZuMHhevuvjeB6oZXRk",
    link: { text: "상세 보기", href: "#" }
  },
  {
    category: "필독",
    date: "2026년 10월 10일",
    title: "개회식 및 선수 브리핑",
    body: "모든 선수는 내일 저녁 6시 클럽하우스 파빌리온에서 진행되는 필수 브리핑에 참석해야 합니다.",
    meta: { icon: "location_on", text: "클럽하우스 파빌리온, A섹션" }
  },
  {
    category: "",
    date: "2026년 10월 09일",
    title: "챔피언십 트로피 공개",
    body: "올해의 챔피언을 위해 수공예로 제작된 2026 KHU Sports Golf 순회 우승컵의 공식 공개 행사에 참여하세요.",
    highlight: true,
    link: { text: "공개 행사 RSVP", href: "#" }
  },
  {
    category: "행정",
    date: "2026년 10월 08일",
    title: "락커룸 배정 안내",
    body: "모든 참가자에게 락커 번호가 배정되었습니다. 선수 포털에서 본인의 고유 코드를 확인하세요.",
    link: { text: "선수 포털 ↗", href: "#" }
  }
];

export default function NoticesPage() {
  return (
    <main className="home-app">
      <Header currentPath="/notices" />

      <section className="stitch-page-canvas">
        {/* Title + Search */}
        <div className="notices-header">
          <div>
            <h1>대회 공지사항</h1>
            <p>KHU Sports 골프 챔피언십의 최신 공식 공지, 규정 변경 및 일정 업데이트를 확인하세요.</p>
          </div>
          <div className="notices-search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="공지사항 검색..." />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="notices-filters" aria-label="공지 필터">
          {filters.map((filter, i) => (
            <button className={i === 0 ? "active" : ""} type="button" key={filter}>
              {filter}
            </button>
          ))}
        </div>

        {/* Grid Cards */}
        <div className="notices-grid">
          {/* Featured card (large) */}
          <article className="notice-card featured">
            {notices[0].image && (
              <div className="notice-card-img" style={{ backgroundImage: `url("${notices[0].image}")` }} />
            )}
            <div className="notice-card-body">
              <div className="notice-card-meta">
                {notices[0].category && <span className="notice-badge urgent">{notices[0].category}</span>}
                <time>{notices[0].date}</time>
              </div>
              <h2>{notices[0].title}</h2>
              <p>{notices[0].body}</p>
              {notices[0].link && (
                <a className="notice-card-link" href={notices[0].link.href}>{notices[0].link.text}</a>
              )}
            </div>
          </article>

          {/* Side card */}
          <article className="notice-card side">
            {notices[1].image && (
              <div className="notice-card-img compact" style={{ backgroundImage: `url("${notices[1].image}")` }} />
            )}
            <div className="notice-card-body">
              <div className="notice-card-meta">
                {notices[1].category && <span className="notice-badge rule">{notices[1].category}</span>}
                <time>{notices[1].date}</time>
              </div>
              <h2>{notices[1].title}</h2>
              <p>{notices[1].body}</p>
              {notices[1].link && (
                <a className="notice-card-link" href={notices[1].link.href}>{notices[1].link.text}</a>
              )}
            </div>
          </article>

          {/* Bottom row — 3 equal cards */}
          {notices.slice(2).map((notice) => (
            <article
              className={`notice-card${notice.highlight ? " highlight" : ""}`}
              key={notice.title}
            >
              <div className="notice-card-body">
                <div className="notice-card-meta">
                  {notice.category && <span className="notice-badge">{notice.category}</span>}
                  <time>{notice.date}</time>
                </div>
                <h2>{notice.title}</h2>
                <p>{notice.body}</p>
                {notice.meta && (
                  <div className="notice-card-loc">
                    <span className="material-symbols-outlined">{notice.meta.icon}</span>
                    <span>{notice.meta.text}</span>
                  </div>
                )}
                {notice.link && (
                  <a className={`notice-card-link${notice.highlight ? " btn" : ""}`} href={notice.link.href}>
                    {notice.link.text}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="notices-pagination">
          <button type="button" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>…</span>
          <button type="button">12</button>
          <button type="button">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>

      <Footer />

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {mobileNavItems.map((item) => (
          <Link className={item.href === "/notices" ? "active" : ""} href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
