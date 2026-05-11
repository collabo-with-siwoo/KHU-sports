import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentMember } from "@/lib/members";
import { listMemberScoreArchive } from "@/lib/results";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const member = await getCurrentMember();
  const scoreArchive = member ? await listMemberScoreArchive(member.id).catch(() => []) : [];

  return (
    <main className="home-app">
      <Header currentPath="/mypage" />

      <section className="stitch-page-canvas">
        <div className="stitch-page-title">
          <p className="stitch-label">My Page</p>
          <h1>내 기록</h1>
          <p>
            본인 정보, 선수 등록 안내, PLAYER 승인 후 본인 상세 스코어카드를
            확인하는 공간입니다.
          </p>
        </div>

        <div className="stitch-bento-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <article className="stitch-bento-card">
            <i />
            <strong>회원 정보</strong>
            <p>
              {member
                ? `${member.name}님은 현재 ${member.userType} 회원입니다.`
                : "가입 직후에는 GENERAL 회원으로 시작합니다. 관리자가 확인 후 PLAYER로 전환합니다."}
            </p>
          </article>
          <article className="stitch-bento-card">
            <i />
            <strong>선수 등록</strong>
            <p>로그인 후 참가 신청을 진행하면 관리자가 확인 후 승인합니다.</p>
            <Link className="text-link" href="/mypage/scores">
              내 기록 아카이브 보기
            </Link>
          </article>
        </div>

        <section className="profile-preview" style={{ marginTop: "48px" }}>
          <div>
            <span>{member?.userType ?? "GENERAL"}</span>
            <strong>
              {member ? `${member.name}님의 회원 상태: ${member.status}` : "선수 등록 승인이 필요합니다"}
            </strong>
            <p>
              {member
                ? `아이디 ${member.username} / 이메일 ${member.email}`
                : "가입 직후에는 일반 회원으로 시작합니다. 로그인 후 참가 신청을 진행하면 관리자가 확인 후 PLAYER로 전환합니다."}
            </p>
          </div>
          <div className="profile-actions">
            {member ? null : (
              <Link className="button primary" href="/login">
                로그인
              </Link>
            )}
            <Link className="button ghost" href="/signup">
              {member ? "회원 정보 수정 예정" : "회원가입"}
            </Link>
          </div>
        </section>

        <section className="score-archive-section">
          <div className="stitch-page-title compact">
            <p className="stitch-label">Score Archive</p>
            <h2>내 기록 아카이브</h2>
            <p>
              PLAYER 승인 후 관리자 입력이 완료된 대회 기록과 라운드별 상세 스코어카드를
              본인에게만 표시합니다.
            </p>
          </div>

          {!member ? (
            <div className="result-privacy-panel">
              <span className="material-symbols-outlined">login</span>
              <div>
                <strong>로그인이 필요합니다</strong>
                <p>본인 기록 아카이브는 로그인 후 확인할 수 있습니다.</p>
                <Link href="/login">로그인</Link>
              </div>
            </div>
          ) : member.userType !== "PLAYER" ? (
            <div className="result-privacy-panel">
              <span className="material-symbols-outlined">lock_person</span>
              <div>
                <strong>선수 등록 승인이 필요합니다</strong>
                <p>
                  현재 회원 유형은 {member.userType}입니다. 관리자가 PLAYER로 승인한 뒤
                  본인의 상세 스코어카드와 누적 기록을 확인할 수 있습니다.
                </p>
              </div>
            </div>
          ) : scoreArchive.length ? (
            <div className="score-archive-list">
              {scoreArchive.map((archive) => (
                <article className="score-archive-card" key={archive.tournamentId}>
                  <header>
                    <div>
                      <span>{archive.status}</span>
                      <strong>{archive.tournamentName}</strong>
                      <p>
                        {archive.period} · {archive.venue} · {archive.affiliation}
                      </p>
                    </div>
                    <em>
                      {archive.total}타 / {archive.topar > 0 ? `+${archive.topar}` : archive.topar}
                    </em>
                  </header>
                  <div className="score-round-table">
                    <div>
                      <span>R</span>
                      <span>전반</span>
                      <span>후반</span>
                      <span>합계</span>
                      <span>순위</span>
                    </div>
                    {archive.rounds.map((round) => (
                      <div key={round.id}>
                        <strong>{round.round}R</strong>
                        <span>{round.front9}</span>
                        <span>{round.back9}</span>
                        <span>{round.total}</span>
                        <span>{round.rank ? `${round.rank}위` : "-"}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="result-privacy-panel">
              <span className="material-symbols-outlined">scoreboard</span>
              <div>
                <strong>아직 등록된 스코어가 없습니다</strong>
                <p>관리자가 대회별 스코어를 입력하면 이곳에 내 기록이 누적됩니다.</p>
              </div>
            </div>
          )}
        </section>
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
