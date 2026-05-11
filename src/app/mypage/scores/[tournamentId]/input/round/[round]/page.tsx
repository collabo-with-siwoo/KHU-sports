import Link from "next/link";
import { forbidden, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCurrentMember } from "@/lib/members";
import { getMyScoreInputContext, type MyScoreInputContext } from "@/lib/results";
import { ScoreInputForm } from "./score-input-form";

export const dynamic = "force-dynamic";

type ScoreInputPageProps = {
  params: Promise<{
    tournamentId: string;
    round: string;
  }>;
};

function formatGender(gender: MyScoreInputContext["gender"]) {
  if (gender === "MALE") {
    return "남성";
  }

  if (gender === "FEMALE") {
    return "여성";
  }

  return "-";
}

function PlayerRequiredPanel({ userType }: { userType: string }) {
  return (
    <div className="result-privacy-panel">
      <span className="material-symbols-outlined">lock_person</span>
      <div>
        <strong>선수 등록이 필요합니다</strong>
        <p>현재 회원 유형은 {userType}입니다. PLAYER 승인 후 본인 스코어를 입력할 수 있습니다.</p>
        <Link href="/mypage">마이페이지로 돌아가기</Link>
      </div>
    </div>
  );
}

function ScoreInputShell({ context }: { context: MyScoreInputContext }) {
  return (
    <div className="my-score-detail">
      <header className="my-score-detail-hero">
        <div>
          <span className={`score-status-badge ${context.status.toLowerCase().replaceAll("_", "-")}`}>
            {context.statusLabel}
          </span>
          <h1>
            {context.tournamentName} Round {context.round}
          </h1>
          <p>
            {context.venue} · {context.period}
          </p>
          <p className="my-score-status-message">{context.statusMessage}</p>
        </div>
        <dl>
          <div>
            <dt>선수명</dt>
            <dd>{context.playerName}</dd>
          </div>
          <div>
            <dt>학교</dt>
            <dd>{context.school ?? "-"}</dd>
          </div>
          <div>
            <dt>성별</dt>
            <dd>{formatGender(context.gender)}</dd>
          </div>
        </dl>
      </header>

      {context.rejectionReason ? (
        <section className="my-score-memo-panel danger">
          <span className="material-symbols-outlined">report</span>
          <div>
            <strong>반려 사유</strong>
            <p>{context.rejectionReason}</p>
          </div>
        </section>
      ) : null}

      <ScoreInputForm context={context} />
    </div>
  );
}

export default async function ScoreInputPage({ params }: ScoreInputPageProps) {
  const { tournamentId, round: roundParam } = await params;
  const round = Number(roundParam);
  const member = await getCurrentMember();

  if (!member) {
    redirect(`/login?next=${encodeURIComponent(`/mypage/scores/${tournamentId}/input/round/${roundParam}`)}`);
  }

  const context =
    member.userType === "PLAYER" && Number.isInteger(round)
      ? await getMyScoreInputContext(member.id, tournamentId, round)
      : null;

  return (
    <main className="home-app">
      <Header currentPath="/mypage" isAuthenticated={Boolean(member)} />

      <section className="stitch-page-canvas my-score-page">
        <Link className="results-back-link" href={`/mypage/scores/${tournamentId}`}>
          <span className="material-symbols-outlined">arrow_back</span>
          스코어 상세
        </Link>

        {member.userType !== "PLAYER" ? (
          <PlayerRequiredPanel userType={member.userType} />
        ) : context ? (
          <ScoreInputShell context={context} />
        ) : (
          forbidden()
        )}
      </section>

      <Footer />
    </main>
  );
}
