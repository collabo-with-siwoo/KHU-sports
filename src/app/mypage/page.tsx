import Link from "next/link";
import { requestWithdrawalAction } from "./actions";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCurrentMember } from "@/lib/members";
import { getMyOpenScoreInputs, type MyOpenScoreInput } from "@/lib/results";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

export const dynamic = "force-dynamic";

function ScoreInputShortcut({ items }: { items: MyOpenScoreInput[] }) {
  if (!items.length) {
    return null;
  }

  const primary = items.find((item) => item.primaryHref) ?? items[0];

  return (
    <section className="my-score-input-panel compact" aria-labelledby="mypage-score-input-title">
      <div>
        <p className="stitch-label">Score Input</p>
        <h2 id="mypage-score-input-title">진행 중인 대회 스코어 입력</h2>
        <p>{primary.tournamentName} 스코어를 바로 입력할 수 있습니다. 임시 저장 후 제출할 수 있습니다.</p>
      </div>
      {primary.primaryHref && primary.primaryActionLabel ? (
        <Link className="my-score-action primary" href={primary.primaryHref}>
          {primary.primaryActionLabel}
        </Link>
      ) : (
        <Link className="my-score-action secondary" href="/mypage/scores">
          입력 상태 확인
        </Link>
      )}
    </section>
  );
}

function WithdrawalPanel({ isActive }: { isActive: boolean }) {
  if (!isActive) {
    return (
      <section className="profile-preview">
        <div>
          <span>Withdrawal</span>
          <strong>탈퇴 신청은 ACTIVE 회원만 가능합니다.</strong>
          <p>현재 계정 상태에서는 마이페이지에서 직접 탈퇴 신청을 진행할 수 없습니다. 운영자에게 문의해주세요.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-preview">
      <div>
        <span>Withdrawal</span>
        <strong>회원 탈퇴 신청</strong>
        <p>
          신청 즉시 로그인이 차단되고 30일 유예 상태로 전환됩니다. 대회 공식 기록은 Player 기록으로 익명화되어
          보존될 수 있습니다.
        </p>
      </div>
      <form action={requestWithdrawalAction} className="member-inline-form">
        <input name="confirmText" placeholder="탈퇴 신청" />
        <button className="button ghost" type="submit">
          탈퇴 신청
        </button>
      </form>
    </section>
  );
}

export default async function MyPage() {
  const member = await getCurrentMember();
  const openScoreInputs =
    member?.userType === "PLAYER" && member.status === "ACTIVE"
      ? await getMyOpenScoreInputs(member.id).catch(() => [])
      : [];

  return (
    <main className="home-app">
      <Header currentPath="/mypage" isAuthenticated={Boolean(member)} />

      <section className="stitch-page-canvas">
        <div className="stitch-page-title">
          <p className="stitch-label">My Page</p>
          <h1>내 기록</h1>
          <p>
            회원 정보, 선수 승인 상태, 진행 중인 스코어 입력, 개인 기록 아카이브로 이동하는 가벼운 대시보드입니다.
          </p>
        </div>

        <div className="stitch-bento-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <article className="stitch-bento-card">
            <i />
            <strong>회원 정보</strong>
            <p>
              {member
                ? `${member.name}님은 현재 ${member.userType} 회원이며 상태는 ${member.status}입니다.`
                : "로그인하면 회원 상태와 선수 승인 상태를 확인할 수 있습니다."}
            </p>
          </article>
          <article className="stitch-bento-card">
            <i />
            <strong>{member?.userType === "PLAYER" ? "스코어 입력" : "선수 등록"}</strong>
            <p>
              {member?.userType === "PLAYER"
                ? "진행 중인 대회가 있으면 마이페이지에서 바로 라운드별 스코어를 입력할 수 있습니다."
                : "가입 직후에는 GENERAL 회원입니다. 관리자 승인 후 PLAYER 기록 기능을 사용할 수 있습니다."}
            </p>
            <Link className="text-link" href="/mypage/scores">
              {member?.userType === "PLAYER" ? "스코어 입력으로 이동" : "선수 기록 안내 보기"}
            </Link>
            {member?.userType === "PLAYER" ? (
              <Link className="text-link" href="/mypage/score-results">
                스코어 결과 보기
              </Link>
            ) : null}
          </article>
        </div>

        <ScoreInputShortcut items={openScoreInputs} />

        <section className="profile-preview" style={{ marginTop: "48px" }}>
          <div>
            <span>{member?.userType ?? "GENERAL"}</span>
            <strong>{member ? `${member.name}님의 회원 상태: ${member.status}` : "로그인이 필요합니다"}</strong>
            <p>
              {member
                ? `아이디 ${member.username} / 이메일 ${member.email}`
                : "로그인 후 마이페이지에서 선수 승인 상태와 개인 기록을 확인할 수 있습니다."}
            </p>
          </div>
          <div className="profile-actions">
            {member ? null : (
              <Link className="button primary" href="/login">
                로그인
              </Link>
            )}
            <Link className="button ghost" href={member ? "/mypage/score-results" : "/signup"}>
              {member ? "기록 아카이브" : "회원가입"}
            </Link>
          </div>
        </section>

        <section className="score-archive-section">
          <div className="stitch-page-title compact">
            <p className="stitch-label">Score Archive</p>
            <h2>내 기록 아카이브</h2>
            <p>
              마이페이지 첫 화면은 빠르게 열리도록 전체 기록 목록을 즉시 불러오지 않습니다. 상세 기록은 전용 화면에서
              확인합니다.
            </p>
          </div>

          {!member ? (
            <div className="result-privacy-panel">
              <span className="material-symbols-outlined">login</span>
              <div>
                <strong>로그인이 필요합니다.</strong>
                <p>본인 기록 아카이브는 로그인 후 확인할 수 있습니다.</p>
                <Link href="/login">로그인</Link>
              </div>
            </div>
          ) : member.userType !== "PLAYER" ? (
            <div className="result-privacy-panel">
              <span className="material-symbols-outlined">lock_person</span>
              <div>
                <strong>선수 등록 승인이 필요합니다.</strong>
                <p>현재 회원 유형은 {member.userType}입니다. 관리자가 PLAYER로 승인한 뒤 본인 기록을 확인할 수 있습니다.</p>
              </div>
            </div>
          ) : (
            <div className="result-privacy-panel">
              <span className="material-symbols-outlined">scoreboard</span>
              <div>
                <strong>전용 화면에서 기록을 확인합니다.</strong>
                <p>전체 스코어 기록과 대회별 상세 scorecard는 기록 아카이브 화면에서 조회합니다.</p>
                <Link href="/mypage/score-results">기록 아카이브 열기</Link>
              </div>
            </div>
          )}
        </section>

        {member ? <WithdrawalPanel isActive={member.status === "ACTIVE"} /> : null}
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
