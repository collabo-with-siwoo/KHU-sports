import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCurrentMember } from "@/lib/members";
import {
  getPublicPlayerScorecard,
  getTournamentLeaderboard,
  searchTournamentPlayers,
  type LeaderboardFilters as LeaderboardFilterValues,
  type PlayerSearchFilters,
  type PublicLeaderboardRow,
  type PublicScorecard,
  type PublicScorecardSearchResult,
  type ResultScoreSortDirection,
  type ResultScoreSortKey
} from "@/lib/results";
import { LeaderboardFilters } from "./leaderboard-filters";
import { ScorecardFilters } from "./scorecard-filters";

export const dynamic = "force-dynamic";

type ResultsDetailPageProps = {
  params: Promise<{ tournamentId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const mobileNavItems = [
  { label: "홈", icon: "home", href: "/" },
  { label: "경기결과", icon: "leaderboard", href: "/results" },
  { label: "대회정보", icon: "event", href: "/schedule" },
  { label: "공지사항", icon: "campaign", href: "/notices" }
];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(value: string | string[] | undefined) {
  const parsed = Number(firstParam(value));
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : undefined;
}

function parseGender(value: string | string[] | undefined): LeaderboardFilterValues["gender"] {
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

function parseCommonFilters(searchParams: Record<string, string | string[] | undefined>) {
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

function parseLeaderboardFilters(searchParams: Record<string, string | string[] | undefined>): LeaderboardFilterValues {
  return parseCommonFilters(searchParams);
}

function parseScorecardFilters(searchParams: Record<string, string | string[] | undefined>): PlayerSearchFilters {
  return parseCommonFilters(searchParams);
}

function hasScorecardSearch(filters: PlayerSearchFilters) {
  return Boolean(
    filters.name ||
      filters.school ||
      filters.category ||
      filters.gender ||
      filters.groupNo ||
      filters.rankMin ||
      filters.rankMax ||
      filters.finalOnly ||
      filters.sortBy ||
      filters.sortDir
  );
}

function formatGender(gender: PublicLeaderboardRow["gender"]) {
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

function pageHref(
  tournamentId: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
  tab: "leaderboard" | "scorecard"
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const firstValue = firstParam(value);

    if (firstValue && key !== "page" && key !== "playerId") {
      params.set(key, firstValue);
    }
  }

  params.set("page", String(page));
  params.set("tab", tab);

  return `/results/${tournamentId}?${params.toString()}`;
}

function scorecardHref(tournamentId: string, playerId: string) {
  return `/results/${tournamentId}?${new URLSearchParams({ tab: "scorecard", playerId }).toString()}`;
}

function scorecardSelectHref(
  tournamentId: string,
  searchParams: Record<string, string | string[] | undefined>,
  playerId: string
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const firstValue = firstParam(value);

    if (firstValue && key !== "page") {
      params.set(key, firstValue);
    }
  }

  params.set("tab", "scorecard");
  params.set("playerId", playerId);

  return `/results/${tournamentId}?${params.toString()}`;
}

function activeTab(searchParams: Record<string, string | string[] | undefined>) {
  return firstParam(searchParams.tab) === "scorecard" ? "scorecard" : "leaderboard";
}

function ScorecardSearchResults({
  result,
  searchParams,
  tournamentId
}: {
  result: PublicScorecardSearchResult;
  searchParams: Record<string, string | string[] | undefined>;
  tournamentId: string;
}) {
  if (!result.rows.length) {
    return (
      <div className="leaderboard-empty-state scorecard-empty-state">
        <span className="material-symbols-outlined">search_off</span>
        <strong>검색 결과가 없습니다</strong>
        <p>검색어를 줄이거나 필터를 초기화해 다시 확인해 주세요.</p>
      </div>
    );
  }

  return (
    <section className="scorecard-search-results" aria-live="polite">
      <div className="leaderboard-summary">
        <p>
          검색 결과 <strong>{result.total}</strong>명
        </p>
        <span>
          {result.page} / {result.pageCount || 1} 페이지
        </span>
      </div>
      <div className="lb-table-wrap scorecard-results-table">
        <table className="lb-table">
          <thead>
            <tr>
              <th>선수명</th>
              <th>학교</th>
              <th>참가구분</th>
              <th>성별</th>
              <th className="num">1R</th>
              <th className="num">2R</th>
              <th className="num total">총타수</th>
              <th>순위</th>
              <th>조</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.tournamentPlayerId}>
                <td className="name-cell">{row.playerName}</td>
                <td>{row.school ?? "-"}</td>
                <td>{row.category ?? "-"}</td>
                <td>{formatGender(row.gender)}</td>
                <td className="num">{formatScore(row.round1Total)}</td>
                <td className="num">{formatScore(row.round2Total)}</td>
                <td className="num total">{formatScore(row.total36)}</td>
                <td>{row.rank ?? "-"}</td>
                <td>{row.groupNo ?? "-"}</td>
                <td>
                  <Link
                    className="scorecard-link-button"
                    href={scorecardSelectHref(tournamentId, searchParams, row.tournamentPlayerId)}
                  >
                    선택
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="scorecard-result-card-list">
        {result.rows.map((row) => (
          <article className="leaderboard-mobile-card" key={row.tournamentPlayerId}>
            <header>
              <span>{row.rank ?? "-"}</span>
              <div>
                <strong>{row.playerName}</strong>
                <p>
                  {row.school ?? "-"} · {row.category ?? "-"} · {formatGender(row.gender)}
                </p>
              </div>
            </header>
            <dl>
              <div>
                <dt>1R</dt>
                <dd>{formatScore(row.round1Total)}</dd>
              </div>
              <div>
                <dt>2R</dt>
                <dd>{formatScore(row.round2Total)}</dd>
              </div>
              <div>
                <dt>총타수</dt>
                <dd>{formatScore(row.total36)}</dd>
              </div>
              <div>
                <dt>조</dt>
                <dd>{row.groupNo ?? "-"}</dd>
              </div>
            </dl>
            <Link href={scorecardSelectHref(tournamentId, searchParams, row.tournamentPlayerId)}>선택</Link>
          </article>
        ))}
      </div>
      {result.pageCount > 1 ? (
        <nav className="leaderboard-pagination" aria-label="Scorecard 검색 결과 페이지">
          {result.page > 1 ? (
            <Link href={pageHref(tournamentId, searchParams, result.page - 1, "scorecard")}>이전</Link>
          ) : (
            <span>이전</span>
          )}
          <strong>
            {result.page} / {result.pageCount}
          </strong>
          {result.page < result.pageCount ? (
            <Link href={pageHref(tournamentId, searchParams, result.page + 1, "scorecard")}>다음</Link>
          ) : (
            <span>다음</span>
          )}
        </nav>
      ) : null}
    </section>
  );
}

function HoleScoreTable({ holes }: { holes: NonNullable<PublicScorecard["rounds"][number]["holeScores"]> }) {
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
          <span key={`par-${hole.hole}`}>{hole.par ?? "-"}</span>
        ))}
      </div>
      <div>
        <span>Score</span>
        {holes.map((hole) => (
          <strong key={`score-${hole.hole}`}>{hole.score ?? "-"}</strong>
        ))}
      </div>
    </div>
  );
}

function ScorecardDetail({ scorecard }: { scorecard: PublicScorecard }) {
  return (
    <section className="scorecard-detail-panel">
      <header className="scorecard-detail-heading">
        <div>
          <p className="stitch-label">Public Scorecard</p>
          <h2>{scorecard.playerName}</h2>
          <p>
            {scorecard.school ?? "-"} · {scorecard.category ?? "-"} · {formatGender(scorecard.gender)}
          </p>
        </div>
        <dl>
          <div>
            <dt>대회명</dt>
            <dd>{scorecard.tournamentName}</dd>
          </div>
          <div>
            <dt>최종순위</dt>
            <dd>{scorecard.finalRank ?? "-"}</dd>
          </div>
          <div>
            <dt>36홀 합계</dt>
            <dd>{formatScore(scorecard.total36)}</dd>
          </div>
        </dl>
      </header>

      <div className="scorecard-round-grid">
        {scorecard.rounds.map((round) => (
          <article className="scorecard-round-card" key={round.round}>
            <header>
              <strong>Round {round.round}</strong>
              <span>
                {round.groupNo ?? "조 미정"} · {round.teeTime ?? "출발시간 미정"}
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
                <dd>{formatScore(round.roundTotal)}</dd>
              </div>
            </dl>
            {round.holeScores?.length ? <HoleScoreTable holes={round.holeScores} /> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function ResultsDetailPage({ params, searchParams }: ResultsDetailPageProps) {
  const { tournamentId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const tab = activeTab(resolvedSearchParams);
  const [member, leaderboard] = await Promise.all([
    getCurrentMember(),
    getTournamentLeaderboard(tournamentId, parseLeaderboardFilters(resolvedSearchParams))
  ]);

  if (!leaderboard.tournament) {
    notFound();
  }

  const tournament = leaderboard.tournament;
  const scorecardFilters = parseScorecardFilters(resolvedSearchParams);
  const scorecardHasSearch = hasScorecardSearch(scorecardFilters);
  const selectedPlayerId = firstParam(resolvedSearchParams.playerId);
  const scorecardResult =
    tab === "scorecard" && scorecardHasSearch ? await searchTournamentPlayers(tournamentId, scorecardFilters) : null;
  const selectedScorecard =
    tab === "scorecard" && selectedPlayerId ? await getPublicPlayerScorecard(tournamentId, selectedPlayerId) : null;

  return (
    <main className="home-app">
      <Header currentPath="/results" isAuthenticated={Boolean(member)} />

      <section className="stitch-page-canvas results-detail-page">
        <Link className="results-back-link" href="/results">
          <span className="material-symbols-outlined">arrow_back</span>
          결과 목록
        </Link>

        <header className="results-detail-hero">
          <div>
            <p className="stitch-label">Tournament Results</p>
            <h1>{tournament.name}</h1>
            <p>
              {tournament.venue} · {tournament.period}
            </p>
          </div>
          <span>{tournament.status}</span>
        </header>

        <nav className="results-detail-tabs" aria-label="결과 상세 탭">
          <Link className={tab === "leaderboard" ? "active" : ""} href={`/results/${tournamentId}`}>
            Full Leaderboard
          </Link>
          <Link className={tab === "scorecard" ? "active" : ""} href={`/results/${tournamentId}?tab=scorecard`}>
            Scorecard
          </Link>
        </nav>

        {tab === "leaderboard" ? (
          <>
            <LeaderboardFilters />

            <div className="leaderboard-summary">
              <p>
                검색 결과 <strong>{leaderboard.total}</strong>명
              </p>
              <span>
                {leaderboard.page} / {leaderboard.pageCount || 1} 페이지
              </span>
            </div>

            {leaderboard.rows.length ? (
              <>
                <div className="lb-table-wrap detail-leaderboard-table" aria-live="polite">
                  <table className="lb-table">
                    <thead>
                      <tr>
                        <th>순위</th>
                        <th>선수명</th>
                        <th>학교</th>
                        <th>참가구분</th>
                        <th>성별</th>
                        <th className="num">1R</th>
                        <th className="num">2R</th>
                        <th className="num total">36홀 합계</th>
                        <th>최종일 진출</th>
                        <th>조</th>
                        <th>출발시간</th>
                        <th>Scorecard</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.rows.map((row, index) => (
                        <tr
                          className={index === 0 && leaderboard.page === 1 ? "leader-row" : ""}
                          key={row.tournamentPlayerId}
                        >
                          <td className="rank-cell">{row.rank ?? "-"}</td>
                          <td className="name-cell">{row.playerName}</td>
                          <td className="aff-cell">{row.school ?? "-"}</td>
                          <td>{row.category ?? "-"}</td>
                          <td>{formatGender(row.gender)}</td>
                          <td className="num">{formatScore(row.round1Total)}</td>
                          <td className="num">{formatScore(row.round2Total)}</td>
                          <td className="num total">{formatScore(row.total36)}</td>
                          <td>{row.finalRoundEligible ? "진출" : "-"}</td>
                          <td>{row.groupNo ?? "-"}</td>
                          <td>{row.teeTime ?? "-"}</td>
                          <td>
                            <Link className="scorecard-link-button" href={scorecardHref(tournamentId, row.tournamentPlayerId)}>
                              보기
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="leaderboard-card-list">
                  {leaderboard.rows.map((row) => (
                    <article className="leaderboard-mobile-card" key={row.tournamentPlayerId}>
                      <header>
                        <span>{row.rank ?? "-"}</span>
                        <div>
                          <strong>{row.playerName}</strong>
                          <p>
                            {row.school ?? "-"} · {row.category ?? "-"} · {formatGender(row.gender)}
                          </p>
                        </div>
                      </header>
                      <dl>
                        <div>
                          <dt>1R</dt>
                          <dd>{formatScore(row.round1Total)}</dd>
                        </div>
                        <div>
                          <dt>2R</dt>
                          <dd>{formatScore(row.round2Total)}</dd>
                        </div>
                        <div>
                          <dt>36홀</dt>
                          <dd>{formatScore(row.total36)}</dd>
                        </div>
                        <div>
                          <dt>조/출발</dt>
                          <dd>
                            {row.groupNo ?? "-"} · {row.teeTime ?? "-"}
                          </dd>
                        </div>
                      </dl>
                      <Link href={scorecardHref(tournamentId, row.tournamentPlayerId)}>Scorecard 보기</Link>
                    </article>
                  ))}
                </div>

                {leaderboard.pageCount > 1 ? (
                  <nav className="leaderboard-pagination" aria-label="순위표 페이지">
                    {leaderboard.page > 1 ? (
                      <Link href={pageHref(tournamentId, resolvedSearchParams, leaderboard.page - 1, "leaderboard")}>
                        이전
                      </Link>
                    ) : (
                      <span>이전</span>
                    )}
                    <strong>
                      {leaderboard.page} / {leaderboard.pageCount}
                    </strong>
                    {leaderboard.page < leaderboard.pageCount ? (
                      <Link href={pageHref(tournamentId, resolvedSearchParams, leaderboard.page + 1, "leaderboard")}>
                        다음
                      </Link>
                    ) : (
                      <span>다음</span>
                    )}
                  </nav>
                ) : null}
              </>
            ) : (
              <div className="leaderboard-empty-state">
                <span className="material-symbols-outlined">search_off</span>
                <strong>검색 결과가 없습니다</strong>
                <p>필터를 줄이거나 검색 조건을 초기화해 다시 확인해 주세요.</p>
                <Link href={`/results/${tournamentId}`}>검색 초기화</Link>
              </div>
            )}
          </>
        ) : (
          <div className="scorecard-tab-layout">
            <ScorecardFilters />

            {scorecardResult ? (
              <ScorecardSearchResults result={scorecardResult} searchParams={resolvedSearchParams} tournamentId={tournamentId} />
            ) : null}

            {selectedScorecard ? (
              <ScorecardDetail scorecard={selectedScorecard} />
            ) : selectedPlayerId ? (
              <div className="leaderboard-empty-state scorecard-empty-state">
                <span className="material-symbols-outlined">person_off</span>
                <strong>스코어카드를 찾을 수 없습니다</strong>
                <p>선수를 다시 검색하거나 Full Leaderboard에서 Scorecard를 선택해 주세요.</p>
              </div>
            ) : (
              <div className="scorecard-placeholder">
                <span className="material-symbols-outlined">scoreboard</span>
                <strong>선수명을 검색해 스코어카드를 확인하세요.</strong>
                <p>이름 일부, 학교명, 참가구분, 성별, 조 번호, 순위 범위로 선수를 찾을 수 있습니다.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />

      <nav className="stitch-bottom-nav" aria-label="모바일 메뉴">
        {mobileNavItems.map((item) => (
          <Link className={item.href === "/results" ? "active" : ""} href={item.href} key={item.href}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </main>
  );
}
