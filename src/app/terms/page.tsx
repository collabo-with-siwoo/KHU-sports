import Link from "next/link";
import { activeAgreementSeeds } from "@/lib/agreements";

export default function TermsPage() {
  return (
    <main className="sub-shell">
      <header className="sub-header">
        <Link href="/">KHU Sports Golf</Link>
        <nav>
          <Link href="/signup">회원가입</Link>
          <Link href="/login">로그인</Link>
        </nav>
      </header>
      <section className="sub-hero">
        <p className="eyebrow">Agreements</p>
        <h1>약관</h1>
        <p className="lead">
          운영 환경에서는 관리자 약관 관리에서 활성화된 최신 버전만 노출합니다.
        </p>
      </section>
      <section className="terms-list">
        {activeAgreementSeeds.map((agreement) => (
          <article className="terms-card" key={agreement.versionId}>
            <span>{agreement.required ? "필수" : "선택"}</span>
            <h2>{agreement.title}</h2>
            <p>{agreement.content}</p>
            <small>
              version {agreement.version} · effective {agreement.effectiveAt}
            </small>
          </article>
        ))}
      </section>
    </main>
  );
}
