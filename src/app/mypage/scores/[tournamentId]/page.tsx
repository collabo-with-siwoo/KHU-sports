import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCurrentMember } from "@/lib/members";
import {
  formatToPar,
  getMyTournamentScoreDetail,
  type MyScoreStatus,
  type MyTournamentScoreDetail
} from "@/lib/results";

export const dynamic = "force-dynamic";

type MyScoreDetailPageProps = {
  params: Promise<{ tournamentId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "마이페이지", icon: "account_circle", href: "/mypage" }
];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatGender(gender: MyTournamentScoreDetail["gender"]) {
  if (gender === "MALE") {
    return "남성";
  }

  if (gender === "FEMALE") {
    return "여성";
  }

  return "-";
}

function formatScore(score: number | null) {
  return typeof score === "number" ? score : "-";
}

function statusClass(status: MyScoreStatus) {
  return `score-status-badge ${status.toLowerCase().replaceAll("_", "-")}`;
}

function getRoundInputLabel(status: MyScoreStatus) {
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

function HoleScoreTable({ holes }: { holes: NonNullable<MyTournamentScoreDetail["rounds"][number]["holeScores"]> }) {
  return (
    <div className="scorecard-hole-table" aria-label="홀별 스코어">
      <div>
        <span>Hole</span>
        {holes.map((hole) => (
          <span key={`hole-${hole.hole}`}>{hole.hole}</span>
        ))}
      </div>
      <div>
        <span>Par</span>
        {holes.map((hole) => (
          <span key={`par-${hole.hole}`}>{hole.par}</span>
        ))}
      </div>
      <div>
        <span>Score</span>
        {holes.map((hole) => (
          <strong className={hole.scoreName ?? undefined} key={`score-${hole.hole}`}>
            {hole.score ?? "-"}
          </strong>
        ))}
      </div>
      <div>
        <span>+/-</span>
        {holes.map((hole) => (
          <span key={`topar-${hole.hole}`}>{formatToPar(hole.toPar)}</span>
        ))}
      </div>
    </div>
  );
}

function PlayerRequiredPanel({ userType }: { userType: string }) {
  return (
    <div className="result-privacy-panel">
      <span className="material-symbols-outlined">lock_person</span>
      <div>
        <strong>선수 등록이 필요합니다</strong>
        <p>
          현재 회원 유형은 {userType}입니다. 관리자가 PLAYER로 승인한 뒤 본인의 대회 상세 스코어를 확인할 수
          있습니다.
        </p>
        <Link href="/mypage">마이페이지로 돌아가기</Link>
      </div>
    </div>
  );
}

function ReinputPanel() {
  return (
    <div className="result-privacy-panel compact">
      <span className="material-symbols-outlined">edit_note</span>
      <div>
        <strong>재입력 준비 상태</strong>
        <p>반려된 스코어의 재입력 화면은 이후 입력 플로우와 연결됩니다. 현재는 반려 상태 확인용 버튼입니다.</p>
      </div>
    </div>
  );
}

function ScoreDetail({ detail, showReinputPanel }: { detail: MyTournamentScoreDetail; showReinputPanel: boolean }) {
  const primaryInputRound = detail.rounds.find((round) => getRoundInputLabel(round.status));

  return (
    <div className="my-score-detail">
      <header className="my-score-detail-hero">
        <div>
          <span className={statusClass(detail.status)}>{detail.statusLabel}</span>
          <h1>{detail.tournamentName}</h1>
          <p>
            {detail.venue} · {detail.period}
          </p>
        </div>
        <dl>
          <div>
            <dt>내 순위</dt>
            <dd>{detail.finalRank ? `${detail.finalRank}위` : "-"}</dd>
          </div>
          <div>
            <dt>36홀 합계</dt>
            <dd>
              {formatScore(detail.total36)} ({formatToPar(detail.totalToPar)})
            </dd>
          </div>
          <div>
            <dt>관리자 확정</dt>
            <dd>{detail.adminConfirmed ? "확정" : "미확정"}</dd>
          </div>
        </dl>
      </header>

      <p className="my-score-status-message">{detail.statusMessage}</p>
      {primaryInputRound ? (
        <section className="my-score-input-panel compact">
          <div>
            <p className="stitch-label">Score Input</p>
            <h2>{primaryInputRound.round}R 입력 바로가기</h2>
            <p>입력이 필요한 라운드를 선택해 임시저장하거나 제출 완료할 수 있습니다.</p>
          </div>
          <Link
            className="my-score-action primary"
            href={`/mypage/scores/${detail.tournamentId}/input/round/${primaryInputRound.round}`}
          >
            {primaryInputRound.round}R {getRoundInputLabel(primaryInputRound.status)}
          </Link>
        </section>
      ) : null}
      {detail.rejectionReason ? (
        <section className="my-score-memo-panel danger">
          <span className="material-symbols-outlined">report</span>
          <div>
            <strong>반려 사유</strong>
            <p>{detail.rejectionReason}</p>
          </div>
        </section>
      ) : null}
      {showReinputPanel && detail.status === "ADMIN_REJECTED" ? <ReinputPanel /> : null}

      <section className="my-score-info-grid">
        <article>
          <span>선수명</span>
          <strong>{detail.playerName}</strong>
        </article>
        <article>
          <span>학교</span>
          <strong>{detail.school ?? "-"}</strong>
        </article>
        <article>
          <span>참가구분</span>
          <strong>{detail.category ?? "-"}</strong>
        </article>
        <article>
          <span>성별</span>
          <strong>{formatGender(detail.gender)}</strong>
        </article>
        <article>
          <span>내 조</span>
          <strong>{detail.groupNo ?? "-"}</strong>
        </article>
        <article>
          <span>출발시간</span>
          <strong>{detail.teeTime ?? "-"}</strong>
        </article>
      </section>

      <section className="my-score-round-section">
        <div className="stitch-page-title compact">
          <p className="stitch-label">Round Scores</p>
          <h2>라운드별 스코어</h2>
        </div>
        <div className="my-score-round-list">
          {detail.rounds.map((round) => (
            <article className="scorecard-round-card" key={round.id}>
              <header>
                <strong>Round {round.round}</strong>
                <span>
                  {round.groupNo ?? detail.groupNo ?? "조 미정"} · {round.teeTime ?? detail.teeTime ?? "출발시간 미정"}
                </span>
              </header>
              <dl className="scorecard-round-stats">
                <div>
                  <dt>front9</dt>
                  <dd>{formatScore(round.front9)}</dd>
                </div>
                <div>
                  <dt>back9</dt>
                  <dd>{formatScore(round.back9)}</dd>
                </div>
                <div>
                  <dt>roundTotal</dt>
                  <dd>
                    {formatScore(round.roundTotal)} ({formatToPar(round.toPar)})
                  </dd>
                </div>
                <div>
                  <dt>Par</dt>
                  <dd>{formatScore(round.par)}</dd>
                </div>
              </dl>
              {round.holeScores?.length ? <HoleScoreTable holes={round.holeScores} /> : null}
              <div className="my-score-round-footer">
                <span className={statusClass(round.status)}>{round.statusLabel}</span>
                <span>{round.adminConfirmed ? "관리자 확정" : "관리자 미확정"}</span>
              </div>
              <p className="my-score-status-message">{round.statusMessage}</p>
              {round.rejectionReason ? <p className="my-score-memo danger">반려 사유: {round.rejectionReason}</p> : null}
              {round.playerMemo ? <p className="my-score-memo">{round.playerMemo}</p> : null}
              {getRoundInputLabel(round.status) ? (
                <Link
                  className="my-score-action secondary"
                  href={`/mypage/scores/${detail.tournamentId}/input/round/${round.round}`}
                >
                  {round.round}R {getRoundInputLabel(round.status)}
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="my-score-memo-panel">
        <span className="material-symbols-outlined">sticky_note_2</span>
        <div>
          <strong>playerMemo</strong>
          <p>{detail.playerMemo ?? "등록된 선수 메모가 없습니다."}</p>
        </div>
      </section>

      {primaryInputRound ? (
        <div className="my-score-actions">
          <Link
            className="my-score-action secondary"
            href={`/mypage/scores/${detail.tournamentId}/input/round/${primaryInputRound.round}`}
          >
            {primaryInputRound.round}R {getRoundInputLabel(primaryInputRound.status)}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default async function MyScoreDetailPage({ params, searchParams }: MyScoreDetailPageProps) {
  const { tournamentId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const member = await getCurrentMember();

  if (!member) {
    redirect(`/login?next=${encodeURIComponent(`/mypage/scores/${tournamentId}`)}`);
  }

  const showReinputPanel = firstParam(resolvedSearchParams.mode) === "reinput";

  return (
    <main className="home-app">
      <Header currentPath="/mypage" isAuthenticated={Boolean(member)} />

      <section className="stitch-page-canvas my-score-page">
        <Link className="results-back-link" href="/mypage/score-results">
          <span className="material-symbols-outlined">arrow_back</span>
          내 기록 아카이브
        </Link>

        {member.userType !== "PLAYER" ? (
          <PlayerRequiredPanel userType={member.userType} />
        ) : (
          <ScoreDetailWrapper memberId={member.id} showReinputPanel={showReinputPanel} tournamentId={tournamentId} />
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

async function ScoreDetailWrapper({
  memberId,
  showReinputPanel,
  tournamentId
}: {
  memberId: string;
  showReinputPanel: boolean;
  tournamentId: string;
}) {
  const detail = await getMyTournamentScoreDetail(memberId, tournamentId);

  if (!detail) {
    forbidden();
  }

  return <ScoreDetail detail={detail} showReinputPanel={showReinputPanel} />;
}
