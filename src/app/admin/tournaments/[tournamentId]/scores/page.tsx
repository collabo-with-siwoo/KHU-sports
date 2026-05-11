import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import {
  getAdminTournamentScores,
  type AdminTournamentScoreFilters,
  type AdminTournamentScoreRow,
  type ResultScoreSortDirection,
  type ResultScoreSortKey
} from "@/lib/results";

export const dynamic = "force-dynamic";

type AdminTournamentScoresPageProps = {
  params: Promise<{ tournamentId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const categoryOptions = ["초등부", "중등부", "고등부", "대학부", "일반부"];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(value: string | string[] | undefined) {
  const parsed = Number(firstParam(value));
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : undefined;
}

function parseGender(value: string | string[] | undefined): AdminTournamentScoreFilters["gender"] {
  const gender = firstParam(value);
  return gender === "MALE" || gender === "FEMALE" ? gender : undefined;
}

function parseSortBy(value: string | string[] | undefined): ResultScoreSortKey | undefined {
  const sortBy = firstParam(value);
  return sortBy === "rank" || sortBy === "name" || sortBy === "school" || sortBy === "round1" || sortBy === "total36"
    ? sortBy
    : undefined;
}

function parseSortDir(value: string | string[] | undefined): ResultScoreSortDirection | undefined {
  const sortDir = firstParam(value);
  return sortDir === "asc" || sortDir === "desc" ? sortDir : undefined;
}

function parseFilters(searchParams: Record<string, string | string[] | undefined>): AdminTournamentScoreFilters {
  return {
    name: firstParam(searchParams.name)?.trim() || undefined,
    school: firstParam(searchParams.school)?.trim() || undefined,
    category: firstParam(searchParams.category)?.trim() || undefined,
    gender: parseGender(searchParams.gender),
    groupNo: firstParam(searchParams.groupNo)?.trim() || undefined,
    rankMin: parsePositiveInt(searchParams.rankMin),
    rankMax: parsePositiveInt(searchParams.rankMax),
    finalOnly: firstParam(searchParams.finalOnly) === "true",
    sortBy: parseSortBy(searchParams.sortBy),
    sortDir: parseSortDir(searchParams.sortDir),
    page: parsePositiveInt(searchParams.page),
    pageSize: 25
  };
}

function pageHref(
  tournamentId: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const firstValue = firstParam(value);

    if (firstValue && key !== "page") {
      params.set(key, firstValue);
    }
  }

  params.set("page", String(page));
  return `/admin/tournaments/${tournamentId}/scores?${params.toString()}`;
}

function formatGender(gender: AdminTournamentScoreRow["gender"]) {
  if (gender === "MALE") {
    return "남";
  }

  if (gender === "FEMALE") {
    return "여";
  }

  return "-";
}

function formatScore(score: number | null) {
  return typeof score === "number" ? score : "-";
}

function FilterForm({
  searchParams,
  tournamentId
}: {
  searchParams: Record<string, string | string[] | undefined>;
  tournamentId: string;
}) {
  return (
    <details className="score-filter-panel admin-score-filter-panel" open>
      <summary>
        <span className="material-symbols-outlined">tune</span>
        검색/필터
      </summary>
      <form action={`/admin/tournaments/${tournamentId}/scores`} className="leaderboard-filter-form" method="get">
        <label>
          <span>선수명</span>
          <input defaultValue={firstParam(searchParams.name) ?? ""} name="name" placeholder="이름 일부 검색" type="search" />
        </label>
        <label>
          <span>학교명</span>
          <input defaultValue={firstParam(searchParams.school) ?? ""} name="school" placeholder="학교명 일부 검색" type="search" />
        </label>
        <label>
          <span>참가구분</span>
          <select defaultValue={firstParam(searchParams.category) ?? ""} name="category">
            <option value="">전체</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>성별</span>
          <select defaultValue={firstParam(searchParams.gender) ?? ""} name="gender">
            <option value="">전체</option>
            <option value="MALE">남</option>
            <option value="FEMALE">여</option>
          </select>
        </label>
        <label>
          <span>조 번호</span>
          <input defaultValue={firstParam(searchParams.groupNo) ?? ""} name="groupNo" placeholder="예: A, 1조" />
        </label>
        <label>
          <span>최소 순위</span>
          <input defaultValue={firstParam(searchParams.rankMin) ?? ""} min="1" name="rankMin" type="number" />
        </label>
        <label>
          <span>최대 순위</span>
          <input defaultValue={firstParam(searchParams.rankMax) ?? ""} min="1" name="rankMax" type="number" />
        </label>
        <label>
          <span>정렬</span>
          <select defaultValue={firstParam(searchParams.sortBy) ?? "rank"} name="sortBy">
            <option value="rank">순위순</option>
            <option value="name">이름순</option>
            <option value="school">학교순</option>
            <option value="round1">1R 스코어순</option>
            <option value="total36">36홀 합계순</option>
          </select>
        </label>
        <label>
          <span>정렬 방향</span>
          <select defaultValue={firstParam(searchParams.sortDir) ?? "asc"} name="sortDir">
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        </label>
        <label className="leaderboard-check">
          <input defaultChecked={firstParam(searchParams.finalOnly) === "true"} name="finalOnly" type="checkbox" value="true" />
          <span>최종일 진출자만 보기</span>
        </label>
        <div className="leaderboard-filter-actions">
          <button className="leaderboard-submit" type="submit">
            검색
          </button>
          <Link className="leaderboard-reset" href={`/admin/tournaments/${tournamentId}/scores`}>
            초기화
          </Link>
        </div>
      </form>
    </details>
  );
}

export default async function AdminTournamentScoresPage({ params, searchParams }: AdminTournamentScoresPageProps) {
  const { tournamentId } = await params;
  await requireAdminPermission("scores", "read", `/admin/tournaments/${tournamentId}/scores`);

  const resolvedSearchParams = (await searchParams) ?? {};
  const result = await getAdminTournamentScores(tournamentId, parseFilters(resolvedSearchParams));

  if (!result.tournament) {
    notFound();
  }

  return (
    <main className="admin-workspace">
      <header className="admin-workspace-header">
        <Link className="admin-home-link dark" href="/admin">
          KHU Sports Admin
        </Link>
        <Link className="admin-secondary-link" href="/admin/tournaments">
          대회 관리
        </Link>
      </header>

      <section className="admin-workspace-main">
        <div className="admin-page-heading">
          <div>
            <p className="panel-kicker">Tournament Scores</p>
            <h1>{result.tournament.name}</h1>
            <p>
              {result.tournament.venue} · {result.tournament.period}
            </p>
          </div>
        </div>

        <section className="admin-export-panel" aria-label="Score Excel downloads">
          <div>
            <p className="panel-kicker">Excel Downloads</p>
            <strong>운영용 파일 내려받기</strong>
            <p>공개용 파일은 개인정보를 포함하지 않습니다. 개인정보 포함 파일은 사유 입력과 권한 확인 후 로그가 남습니다.</p>
          </div>
          <div className="admin-export-actions">
            <Link className="admin-secondary-link" href={`/admin/tournaments/${tournamentId}/exports/leaderboard`}>
              Full Leaderboard
            </Link>
            <Link className="admin-secondary-link" href={`/admin/tournaments/${tournamentId}/exports/admin-scores`}>
              관리자 현황
            </Link>
            <Link className="admin-secondary-link" href={`/admin/tournaments/${tournamentId}/exports/scorecards`}>
              Scorecard
            </Link>
          </div>
          <form action={`/admin/tournaments/${tournamentId}/exports/private`} className="admin-private-export-form" method="get">
            <label>
              개인정보 포함 다운로드 사유
              <input name="reason" placeholder="예: 대회 운영 현황 확인" required />
            </label>
            <button className="admin-secondary-link" type="submit">
              개인정보 포함 다운로드
            </button>
          </form>
        </section>

        <FilterForm searchParams={resolvedSearchParams} tournamentId={tournamentId} />

        <div className="leaderboard-summary">
          <p>
            검색 결과 <strong>{result.total}</strong>명
          </p>
          <span>
            {result.page} / {result.pageCount || 1} 페이지
          </span>
        </div>

        <div className="admin-notice-table">
          <div className="admin-notice-head admin-tournament-score-grid">
            <span>순위</span>
            <span>선수</span>
            <span>학교</span>
            <span>구분/성별</span>
            <span>스코어</span>
            <span>조/출발</span>
            <span>상태</span>
          </div>
          {result.rows.map((row) => (
            <div className="admin-notice-row admin-tournament-score-grid" key={row.tournamentPlayerId}>
              <span>{row.rank ?? "-"}</span>
              <strong>{row.playerName}</strong>
              <span>{row.school ?? "-"}</span>
              <span>
                {row.category ?? "-"} · {formatGender(row.gender)}
              </span>
              <em>
                1R {formatScore(row.round1Total)} · 2R {formatScore(row.round2Total)} · 36홀 {formatScore(row.total36)}
              </em>
              <span>
                {row.groupNo ?? "-"} · {row.teeTime ?? "-"}
              </span>
              <span>{row.statusLabel}</span>
            </div>
          ))}
          {!result.rows.length ? (
            <div className="admin-empty-state">
              <strong>검색 결과가 없습니다</strong>
              <p>검색 조건을 줄이거나 초기화해 주세요.</p>
            </div>
          ) : null}
        </div>

        {result.pageCount > 1 ? (
          <nav className="leaderboard-pagination" aria-label="관리자 스코어 페이지">
            {result.page > 1 ? (
              <Link href={pageHref(tournamentId, resolvedSearchParams, result.page - 1)}>이전</Link>
            ) : (
              <span>이전</span>
            )}
            <strong>
              {result.page} / {result.pageCount}
            </strong>
            {result.page < result.pageCount ? (
              <Link href={pageHref(tournamentId, resolvedSearchParams, result.page + 1)}>다음</Link>
            ) : (
              <span>다음</span>
            )}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
