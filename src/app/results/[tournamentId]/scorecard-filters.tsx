"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useTransition } from "react";

const categoryOptions = ["초등부", "중등부", "고등부", "대학부", "일반부"];
const sortOptions = [
  { label: "순위순", value: "rank" },
  { label: "이름순", value: "name" },
  { label: "학교순", value: "school" },
  { label: "1R 스코어순", value: "round1" },
  { label: "36홀 합계순", value: "total36" }
];

function cleanValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function ScorecardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    params.set("tab", "scorecard");

    for (const key of ["name", "school", "category", "gender", "groupNo", "rankMin", "rankMax", "sortBy", "sortDir"]) {
      const value = cleanValue(formData, key);

      if (value) {
        params.set(key, value);
      }
    }

    if (formData.get("finalOnly") === "on") {
      params.set("finalOnly", "true");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function resetSearch() {
    startTransition(() => {
      router.push(`${pathname}?tab=scorecard`);
    });
  }

  return (
    <details className="score-filter-panel" open>
      <summary>
        <span className="material-symbols-outlined">tune</span>
        선수 검색/필터
      </summary>
      <form className="leaderboard-filter-form scorecard-filter-form" onSubmit={submitSearch}>
        <label>
          <span>선수명</span>
          <input
            autoComplete="off"
            defaultValue={searchParams.get("name") ?? ""}
            name="name"
            placeholder="이름 일부 입력"
            type="search"
          />
        </label>
        <label>
          <span>학교명</span>
          <input
            autoComplete="off"
            defaultValue={searchParams.get("school") ?? ""}
            name="school"
            placeholder="학교명 일부 입력"
            type="search"
          />
        </label>
        <label>
          <span>참가구분</span>
          <select defaultValue={searchParams.get("category") ?? ""} name="category">
            <option value="">전체</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>성별</span>
          <select defaultValue={searchParams.get("gender") ?? ""} name="gender">
            <option value="">전체</option>
            <option value="MALE">남</option>
            <option value="FEMALE">여</option>
          </select>
        </label>
        <label>
          <span>조 번호</span>
          <input defaultValue={searchParams.get("groupNo") ?? ""} name="groupNo" placeholder="예: A, 1조" />
        </label>
        <label>
          <span>최소 순위</span>
          <input defaultValue={searchParams.get("rankMin") ?? ""} min="1" name="rankMin" placeholder="1" type="number" />
        </label>
        <label>
          <span>최대 순위</span>
          <input defaultValue={searchParams.get("rankMax") ?? ""} min="1" name="rankMax" placeholder="30" type="number" />
        </label>
        <label>
          <span>정렬</span>
          <select defaultValue={searchParams.get("sortBy") ?? "rank"} name="sortBy">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>정렬 방향</span>
          <select defaultValue={searchParams.get("sortDir") ?? "asc"} name="sortDir">
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        </label>
        <label className="leaderboard-check">
          <input defaultChecked={searchParams.get("finalOnly") === "true"} name="finalOnly" type="checkbox" />
          <span>최종일 진출자만 보기</span>
        </label>
        <div className="leaderboard-filter-actions scorecard-filter-actions">
          <button className="leaderboard-submit" disabled={isPending} type="submit">
            {isPending ? "검색 중..." : "검색"}
          </button>
          <button className="leaderboard-reset" disabled={isPending} onClick={resetSearch} type="button">
            초기화
          </button>
        </div>
      </form>
    </details>
  );
}
