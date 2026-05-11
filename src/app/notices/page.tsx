import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCurrentMember } from "@/lib/members";
import { listPublishedNotices, noticeCategories } from "@/lib/notices";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const [member, notices] = await Promise.all([
    getCurrentMember(),
    listPublishedNotices()
  ]);

  return (
    <main className="home-app notices-page">
      <Header currentPath="/notices" isAuthenticated={Boolean(member)} />

      <aside className="stitch-sidebar" aria-label="공지 카테고리">
        {noticeCategories.map((category, index) => (
          <a className={index === 0 ? "active" : ""} href="#notice-feed" key={category}>
            <span className="material-symbols-outlined">
              {index === 0 ? "campaign" : "label"}
            </span>
            {category}
          </a>
        ))}
      </aside>

      <section className="stitch-page-canvas">
        <div className="stitch-page-title">
          <p className="stitch-label">Official Notice</p>
          <h1>대회 공지사항</h1>
          <p>
            참가 안내, 일정 변경, 규정 공지, 선수 확인 사항을 한곳에서 확인할 수 있습니다.
          </p>
        </div>

        <div className="stitch-filterbar" aria-label="공지 검색">
          <label>
            <span className="material-symbols-outlined">search</span>
            <input placeholder="공지 제목, 카테고리 검색" type="search" />
          </label>
          <button type="button">
            <span className="material-symbols-outlined">tune</span>
            필터
          </button>
        </div>

        <div className="notice-tabs" aria-label="공지 카테고리 탭">
          {noticeCategories.map((category, index) => (
            <button className={index === 0 ? "active" : ""} key={category} type="button">
              {category}
            </button>
          ))}
        </div>

        <div className="stitch-notice-feed" id="notice-feed">
          {notices.map((notice) => (
            <Link href={`/notices/${notice.id}`} key={notice.id}>
              <article>
                <div>
                  <span>{notice.category}</span>
                  {notice.isPinned && <span>중요</span>}
                  <time dateTime={notice.publishedAt}>{notice.publishedLabel}</time>
                </div>
                <h2>{notice.title}</h2>
                <p>{notice.summary}</p>
              </article>
            </Link>
          ))}
        </div>

        <div className="notice-more">
          <button type="button">
            <span className="material-symbols-outlined">expand_more</span>
            더 보기
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
