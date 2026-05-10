import Image from "next/image";
import Link from "next/link";
import tournamentPoster from "../../../asset/제27회 경희대학교 총장배 전국 골프대회.png";

const statusItems = [
  {
    label: "Milestone",
    title: "M0 Foundation",
    body: "Next.js, TypeScript, Prisma schema, and environment documentation are being prepared."
  },
  {
    label: "Policy",
    title: "Private Scorecards",
    body: "Public results expose rank, name, and total only. Detailed scorecards stay private."
  },
  {
    label: "Members",
    title: "GENERAL First",
    body: "New sign-ups start as general members. Admin approval converts players to PLAYER."
  },
  {
    label: "Compliance",
    title: "Dormant Policy Updated",
    body: "Dormant handling is reserved as an optional service policy, not a mandatory MVP workflow."
  }
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <Link aria-label="KHU Sports home" className="brand" href="/">
          <strong>KHU Sports Golf</strong>
          <span>경희대학교 골프대회</span>
        </Link>
        <nav aria-label="Primary navigation" className="nav">
          <Link href="/notices">공지</Link>
          <Link href="/results">대회 결과</Link>
          <Link href="/mypage">마이페이지</Link>
          <Link href="/admin">관리자</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Official Tournament Website</p>
          <h1>경희대학교 골프대회 공식 홈페이지</h1>
          <p className="lead">
            대회 공지, 결과 공개, 선수별 본인 기록 조회, 어드민 스코어 관리를
            한곳에서 운영하기 위한 MVP 기반을 구축 중입니다.
          </p>
          <div className="actions" aria-label="Main actions">
            <Link className="button primary" href="/notices">
              공지 보기
            </Link>
            <Link className="button secondary" href="/results">
              결과 확인
            </Link>
          </div>
        </div>
        <div className="poster" aria-label="Tournament poster">
          <Image
            alt="제27회 경희대학교 총장배 전국 골프대회 포스터"
            fill
            priority
            src={tournamentPoster}
            sizes="(max-width: 820px) 100vw, 42vw"
          />
        </div>
      </section>

      <section className="status-band" aria-label="Project status">
        <div className="status-grid">
          {statusItems.map((item) => (
            <article className="card" key={item.title}>
              <p className="status-label">{item.label}</p>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
