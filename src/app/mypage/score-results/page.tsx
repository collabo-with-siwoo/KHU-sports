import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCurrentMember } from "@/lib/members";
import {
  formatToPar,
  getMyScoreHistory,
  type MyScoreHistory,
  type MyScoreStatus
} from "@/lib/results";

export const dynamic = "force-dynamic";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "마이페이지", icon: "account_circle", href: "/mypage" }
];

function formatScore(score: number | null) {
  return typeof score === "number" ? score : "-";
}

function statusClass(status: MyScoreStatus) {
  return `score-status-badge ${status.toLowerCase().replaceAll("_", "-")}`;
}

function PlayerRequiredPanel({ userType }: { userType: string }) {
  return (
    <div className="result-privacy-panel">
      <span className="material-symbols-outlined">lock_person</span>
      <div>
        <strong>선수 등록이 필요합니다</strong>
        <p>
          현재 회원 유형은 {userType}입니다. 관리자가 PLAYER로 승인한 뒤 본인의 대회 기록과 상세 스코어를
          확인할 수 있습니다.
        </p>
        <Link href="/mypage">마이페이지로 돌아가기</Link>
      </div>
    </div>
  );
}

function EmptyScoresPanel() {
  return (
    <div className="result-privacy-panel">
      <span className="material-symbols-outlined">scoreboard</span>
      <div>
        <strong>아직 스코어 결과가 없습니다</strong>
        <p>스코어를 제출하거나 관리자가 대회 기록을 확정하면 이곳에서 결과를 확인할 수 있습니다.</p>
        <Link href="/mypage/scores">스코어 입력으로 이동</Link>
      </div>
    </div>
  );
}

function getHistoryInputLabel(status: MyScoreStatus) {
  switch (status) {
    case "NOT_STARTED":
      return "스코어 입력";
    case "DRAFT":
      return "이어쓰기";
    case "ADMIN_REJECTED":
      return "다시 입력";
    default:
      return null;
  }
}

function ScoreHistoryCard({ item }: { item: MyScoreHistory }) {
  const inputLabel = getHistoryInputLabel(item.status);

  return (
    <article className="my-score-card">
      <header>
        <div>
          <span className={statusClass(item.status)}>{item.statusLabel}</span>
          <h2>{item.tournamentName}</h2>
          <p>
            {item.venue} · {item.period}
          </p>
        </div>
        <strong>{item.finalRank ? `${item.finalRank}위` : "순위 미정"}</strong>
      </header>

      <dl className="my-score-metrics">
        <div>
          <dt>1R</dt>
          <dd>{formatScore(item.round1Total)}</dd>
        </div>
        <div>
          <dt>2R</dt>
          <dd>{formatScore(item.round2Total)}</dd>
        </div>
        <div>
          <dt>36홀 합계</dt>
          <dd>
            {formatScore(item.total36)} ({formatToPar(item.totalToPar)})
          </dd>
        </div>
      </dl>

      {item.playerMemo ? <p className="my-score-memo">{item.playerMemo}</p> : null}
      <p className="my-score-status-message">{item.statusMessage}</p>
      {item.rejectionReason ? <p className="my-score-memo danger">반려 사유: {item.rejectionReason}</p> : null}

      <div className="my-score-actions">
        {inputLabel ? (
          <Link className="my-score-action secondary" href={`/mypage/scores/${item.tournamentId}/input/round/1`}>
            {inputLabel}
          </Link>
        ) : null}
        <Link className="my-score-action primary" href={`/mypage/scores/${item.tournamentId}`}>
          결과 상세 보기
        </Link>
      </div>
    </article>
  );
}

export default async function MyScoreResultsPage() {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/login?next=%2Fmypage%2Fscore-results");
  }

  const scores = member.userType === "PLAYER" ? await getMyScoreHistory(member.id) : [];

  return (
    <main className="home-app">
      <Header currentPath="/mypage" isAuthenticated={Boolean(member)} />

      <section className="stitch-page-canvas my-score-page">
        <Link className="results-back-link" href="/mypage/scores">
          <span className="material-symbols-outlined">arrow_back</span>
          스코어 입력
        </Link>

        <div className="stitch-page-title">
          <p className="stitch-label">My Score Results</p>
          <h1>스코어 결과</h1>
          <p>제출한 스코어, 관리자 확정 상태, 대회별 상세 결과를 따로 확인하는 페이지입니다.</p>
        </div>

        <div className="my-score-actions" style={{ justifyContent: "flex-start" }}>
          <Link className="my-score-action secondary" href="/mypage/scores">
            스코어 입력하기
          </Link>
        </div>

        {member.userType !== "PLAYER" ? (
          <PlayerRequiredPanel userType={member.userType} />
        ) : scores.length ? (
          <div className="my-score-list">
            {scores.map((item) => (
              <ScoreHistoryCard item={item} key={item.tournamentId} />
            ))}
          </div>
        ) : (
          <EmptyScoresPanel />
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
