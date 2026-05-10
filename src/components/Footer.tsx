import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong>KHU Sports Golf</strong>
          <p>© 2026 KHU 스포츠 골프 토너먼트 운영국. All Rights Reserved.</p>
        </div>
        <nav className="footer-links" aria-label="푸터 메뉴">
          <Link href="/terms">개인정보 처리방침</Link>
          <Link href="/terms">대회 규정</Link>
          <Link href="mailto:khusports2026@gmail.com">고객 지원</Link>
          <a href="#">스폰서십</a>
        </nav>
        <div className="footer-social">
          <a href="#" aria-label="YouTube">
            <span className="material-symbols-outlined">smart_display</span>
          </a>
          <a href="#" aria-label="공유">
            <span className="material-symbols-outlined">share</span>
          </a>
          <a href="#" aria-label="웹사이트">
            <span className="material-symbols-outlined">language</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
