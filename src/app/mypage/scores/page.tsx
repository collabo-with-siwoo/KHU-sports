import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCurrentMember } from "@/lib/members";
import { getMyOpenScoreInputs, type MyOpenScoreInput } from "@/lib/results";

export const dynamic = "force-dynamic";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "마이페이지", icon: "account_circle", href: "/mypage" }
];

function PlayerRequiredPanel({ userType }: { userType: string }) {
  return (
    <div className="result-privacy-panel">
      <span className="material-symbols-outlined">lock_person</span>
      <div>
        <strong>선수 등록이 필요합니다</strong>
        <p>
          현재 회원 유형은 {userType}입니다. 관리자가 PLAYER로 승인한 뒤 본인 스코어를 입력할 수 있습니다.
        </p>
        <Link href="/mypage">마이페이지로 돌아가기</Link>
      </div>
    </div>
  );
}

function EmptyInputPanel() {
  return (
    <div className="result-privacy-panel">
      <span className="material-symbols-outlined">edit_note</span>
      <div>
        <strong>현재 입력 가능한 스코어가 없습니다</strong>
        <p>
          진행 중인 대회 입력 기간이 열리면 이 화면에서 라운드별 스코어 입력 버튼이 표시됩니다.
        </p>
      </div>
    </div>
  );
}

function OpenScoreInputPanel({ items }: { items: MyOpenScoreInput[] }) {
  if (!items.length) {
    return <EmptyInputPanel />;
  }

  return (
    <section className="my-score-input-panel" aria-labelledby="open-score-input-title">
      <div>
        <p className="stitch-label">Score Input</p>
        <h2 id="open-score-input-title">진행 중인 대회 스코어 입력</h2>
        <p>입력 가능한 라운드를 선택해 임시저장하거나 제출 완료할 수 있습니다.</p>
      </div>
      <div className="my-score-input-list">
        {items.map((item) => (
          <article key={item.tournamentId}>
            <header>
              <div>
                <span>{item.status}</span>
                <strong>{item.tournamentName}</strong>
                <p>
                  {item.venue} · {item.period}
                </p>
              </div>
              {item.primaryHref && item.primaryActionLabel ? (
                <Link className="my-score-action primary" href={item.primaryHref}>
                  {item.primaryActionLabel}
                </Link>
              ) : (
                <span className="my-score-action muted">입력 대기</span>
              )}
            </header>
            <div className="my-score-round-actions">
              {item.rounds.map((round) =>
                round.canEdit && round.actionLabel ? (
                  <Link className="my-score-action secondary" href={round.href} key={round.round}>
                    {round.actionLabel}
                  </Link>
                ) : (
                  <span className="score-status-badge" key={round.round}>
                    {round.round}R {round.statusLabel}
                  </span>
                )
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function MyScoresPage() {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/login?next=%2Fmypage%2Fscores");
  }

  const openInputs =
    member.userType === "PLAYER" ? await getMyOpenScoreInputs(member.id).catch(() => []) : [];

  return (
    <main className="home-app">
      <Header currentPath="/mypage" isAuthenticated={Boolean(member)} />

      <section className="stitch-page-canvas my-score-page">
        <Link className="results-back-link" href="/mypage">
          <span className="material-symbols-outlined">arrow_back</span>
          마이페이지
        </Link>

        <div className="stitch-page-title">
          <p className="stitch-label">Score Input</p>
          <h1>스코어 입력</h1>
          <p>
            PLAYER로 승인된 회원은 이 화면에서 진행 중인 대회의 라운드별 스코어를 입력합니다.
            제출된 결과와 확정 기록은 별도 결과 페이지에서 확인할 수 있습니다.
          </p>
        </div>

        <div className="my-score-actions" style={{ justifyContent: "flex-start" }}>
          <Link className="my-score-action primary" href="/mypage/score-results">
            스코어 결과 보기
          </Link>
        </div>

        {member.userType !== "PLAYER" ? (
          <PlayerRequiredPanel userType={member.userType} />
        ) : (
          <OpenScoreInputPanel items={openInputs} />
        )}
      </section>

      <Footer />

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {mobileNavItems.map((item) => (
          <Link className={item.href === "/mypage" ? "active" : ""} href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
