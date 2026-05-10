import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

export const dynamic = "force-dynamic";

async function getCurrentMember() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return null;
    }

    return prisma.user.findUnique({
      where: { id: data.user.id },
      select: {
        username: true,
        email: true,
        name: true,
        userType: true,
        status: true,
        lastLoginAt: true
      }
    });
  } catch {
    return null;
  }
}

export default async function MyPage() {
  const member = await getCurrentMember();

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
