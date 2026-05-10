import Link from "next/link";
import { activeAgreementSeeds } from "@/lib/agreements";

export default function TermsPage() {
  return (
    <main className="sub-shell">
      <header className="sub-header">
        <Link href="/">KHU Sports Golf</Link>
        <Link href="/signup">회원가입</Link>
      </header>
      <section className="sub-hero">
        <div>
          <p className="eyebrow">Agreements</p>
          <h1>약관</h1>
          <p className="lead">
            실제 운영에서는 관리자 약관 관리에서 활성화된 최신 버전만 노출됩니다.
          </p>
        </div>
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
