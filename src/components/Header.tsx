import Link from "next/link";

const gnbItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Results", href: "/results" },
  { label: "Schedule", href: "/schedule" },
  { label: "Notices", href: "/notices" }
];

interface HeaderProps {
  currentPath?: string;
  isAuthenticated?: boolean;
}

export default function Header({ currentPath = "/", isAuthenticated = false }: HeaderProps) {
  return (
    <header className="home-header">
      <div className="home-header-inner">
        <Link className="home-logo" href="/">
          KHU Sports Golf
        </Link>
        <nav className="home-gnb" aria-label="Primary navigation">
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
          <button aria-label="Search" className="home-icon-btn" type="button">
            <span className="material-symbols-outlined">search</span>
          </button>
          {isAuthenticated ? (
            <>
              <Link className="home-cta-btn" href="/mypage">
                My Page
              </Link>
              <form action="/logout" className="home-logout-form" method="post">
                <button aria-label="Logout" className="home-icon-btn" type="submit">
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link className="home-cta-btn" href="/signup">
                Sign up
              </Link>
              <Link aria-label="Login" className="home-icon-btn" href="/login">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
