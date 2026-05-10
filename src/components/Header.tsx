import Link from "next/link";

const gnbItems = [
  { label: "홈", href: "/" },
  { label: "About", href: "/about" },
  { label: "경기결과", href: "/results" },
  { label: "대회정보", href: "/schedule" },
  { label: "공지사항", href: "/notices" }
];

interface HeaderProps {
  currentPath?: string;
}

export default function Header({ currentPath = "/" }: HeaderProps) {
  return (
    <header className="home-header">
      <div className="home-header-inner">
        <Link className="home-logo" href="/">
          KHU Sports Golf
        </Link>
        <nav className="home-gnb" aria-label="주요 메뉴">
          {gnbItems.map((item) => (
            <Link
              className={item.href === currentPath ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="home-header-actions">
          <button aria-label="검색" className="home-icon-btn" type="button">
            <span className="material-symbols-outlined">search</span>
          </button>
          <Link className="home-cta-btn" href="/signup">
            지금 등록하기
          </Link>
          <Link aria-label="로그인" className="home-icon-btn" href="/login">
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
