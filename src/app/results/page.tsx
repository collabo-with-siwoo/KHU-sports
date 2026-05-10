import Link from "next/link";

const results = [
  { rank: 1, name: "김서준", total: 70 },
  { rank: 2, name: "박도윤", total: 72 },
  { rank: 3, name: "이하린", total: 73 }
];

export default function ResultsPage() {
  return (
    <main className="sub-shell">
      <header className="sub-header">
        <Link href="/">KHU Sports Golf</Link>
        <Link href="/admin">관리자</Link>
      </header>
      <section className="sub-hero">
        <div>
          <p className="eyebrow">Results</p>
          <h1>대회 결과</h1>
          <p className="lead">
            공개 결과는 순위, 이름, 총타수까지만 노출합니다.
          </p>
        </div>
      </section>
      <section className="result-board">
        {results.map((result) => (
          <article className="result-item" key={result.rank}>
            <span>{result.rank}</span>
            <strong>{result.name}</strong>
            <p>{result.total}타</p>
          </article>
        ))}
      </section>
    </main>
  );
}
