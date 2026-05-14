# M6 UI QA 폴리시 구현 계획

> **에이전트 작업자용:** 이 계획을 구현할 때는 `superpowers:subagent-driven-development` 또는 `superpowers:executing-plans`를 사용한다. 단계 추적은 체크박스(`- [ ]`) 문법을 사용한다.

**목표:** M6-A는 기존 M0-M5 핵심 흐름의 시각 품질, 모바일 사용성, 접근성 기본기, 라우트 단위 QA 신뢰도를 개선한다.

**구조:** 먼저 대상 라우트 매트릭스를 실제 브라우저에서 점검하고, 그 결과를 바탕으로 CSS, 페이지 구조, label, 빈 상태, 안내 문구를 작게 수정한다. 새 제품 범위, 인증 정책 변경, 데이터베이스 작업은 포함하지 않는다.

**기술 스택:** Next.js App Router, TypeScript, Prisma, Supabase 인증/세션 페이지, Vitest, Next lint, Playwright 기반 라우트 확인.

---

## 파일 구조

- 수정 후보: `src/app/globals.css`  
  반복되는 반응형, 포커스, overflow, 폼 컨트롤 문제를 정리한다.
- 수정 후보: `src/app/**/page.tsx`  
  특정 화면에서만 발생하는 label, 빈 상태, 문구, 레이아웃 문제를 고친다.
- 수정 후보: `src/components/**`  
  같은 문제가 공유 컴포넌트에서 반복될 때만 수정한다.
- 수정 후보: `docs/specs.md`, `docs/spec-changelog.md`, `docs/context.md`  
  화면 동작이나 라우트 기대값이 바뀐 경우에만 갱신한다.
- 생성: `docs/qa-m6-ui-polish.md`  
  QA 스캔 결과, 이번 브랜치에서 수정한 문제, 후속으로 미룬 문제를 기록한다.

---

### 작업 1: 라우트 QA 목록 작성

**파일:**
- 생성: `docs/qa-m6-ui-polish.md`

- [x] **1단계: 로컬 서버 시작**

실행:

```powershell
npm run dev -- -p 3000
```

기대 결과: 앱이 `http://127.0.0.1:3000`에서 열린다.

- [x] **2단계: 공개 라우트 점검**

다음 라우트를 데스크톱 폭과 375px 모바일 폭에서 연다.

```text
/
/notices
/notices/2026-application-guide
/results
/results/seed-2026
```

문제는 다음 형식으로 기록한다.

```markdown
| Route | Viewport | Issue | Severity | Planned fix |
|---|---:|---|---|---|
| /results/seed-2026 | 375px | 필터 버튼이 좁은 화면에서 어색하게 줄바꿈되고 label이 눌림 | Medium | 필터 grid와 버튼 줄바꿈 CSS 조정 |
```

- [x] **3단계: 인증 및 회원 라우트 점검**

다음 라우트를 데스크톱 폭과 375px 모바일 폭에서 연다.

```text
/login
/signup
/mypage
/mypage/scores
/mypage/score-results
```

로그인이 필요한 페이지는 로그인 전 redirect 또는 안내 상태가 이해 가능한지 기록한다. 사용자가 테스트 계정을 명시적으로 제공하지 않으면 실제 계정으로 로그인하지 않는다.

- [x] **4단계: 관리자 라우트 점검**

다음 라우트를 데스크톱 폭과 375px 모바일 폭에서 연다.

```text
/admin
/admin/notices
/admin/notices/new
/admin/members
/admin/tournaments
/admin/scores
```

보호된 관리자 페이지는 `/admin?next=...`로 이동하는 흐름이 이해 가능한지 기록한다. 삭제, 확정, 탈퇴 확정처럼 상태를 바꾸는 작업은 실행하지 않는다.

- [x] **5단계: QA 로그 저장**

`docs/qa-m6-ui-polish.md`를 다음 구조로 만든다.

```markdown
# M6 UI QA 폴리시 로그

## 범위

## 라우트 스캔

## 이번 브랜치에서 수정한 항목

## 후속 작업
```

기대 결과: 파일에 실제 확인한 문제와 M6-A에서 다루지 않을 후속 문제가 구분되어 있다.

---

### 작업 2: 고효율 UI 및 접근성 수정

**파일:**
- 수정: `src/app/globals.css`
- 수정 후보: `docs/qa-m6-ui-polish.md`에서 확인된 라우트 파일

- [x] **1단계: 수정 대상 선택**

다음 조건을 모두 만족하는 문제만 이번 브랜치에서 수정한다.

```text
1. M6-A 대상 라우트에서 실제로 보이는 문제다.
2. 새 데이터 모델, 인증 정책 변경, 대형 기능 추가 없이 고칠 수 있다.
3. 모바일 사용성, 접근성, 로딩 명확성, 시각 품질 중 하나를 개선한다.
```

- [x] **2단계: 반복 레이아웃 문제를 CSS로 수정**

기존 전역 클래스를 우선 사용한다. 허용되는 CSS 변경 예시는 다음과 같다.

```css
.admin-table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.form-row {
  min-width: 0;
}

.form-row input,
.form-row select,
.form-row textarea {
  max-width: 100%;
}
```

기대 결과: 긴 label, 테이블, 폼 컨트롤이 375px 모바일에서 부모 영역을 넘지 않는다.

- [x] **3단계: 화면별 문구 또는 label 문제 수정**

폼 컨트롤에 보이는 label 또는 접근 가능한 이름이 없으면 실제 label을 추가한다. 예시 패턴은 다음과 같다.

```tsx
<label>
  <span>검색어</span>
  <input name="query" placeholder="선수명 또는 학교" />
</label>
```

기대 결과: 화면은 기존처럼 간결하지만, 폼 컨트롤의 의미가 사용자의 눈과 보조기술 모두에 전달된다.

- [x] **4단계: 개인정보 경계 유지**

결과, 스코어, 회원 관련 화면을 수정할 때는 공개 화면에 비공개 필드가 추가되지 않았는지 확인한다. 공개 화면에는 문서화된 경기 공개 필드만 보여준다.

- [x] **5단계: 수정 라우트 재점검**

수정한 라우트는 375px 모바일 폭과 데스크톱 폭에서 다시 연다. `docs/qa-m6-ui-polish.md`에 수정 완료 항목을 기록한다.

---

### 작업 3: 문서와 검증

**파일:**
- 수정: `docs/qa-m6-ui-polish.md`
- 수정: `docs/specs.md`
- 수정: `docs/spec-changelog.md`
- 수정: `docs/context.md`

- [x] **1단계: M6 문서 갱신**

화면 동작이 바뀌면 `docs/specs.md`에 M6 메모를 짧게 추가한다. `docs/spec-changelog.md`에는 M6-A 항목을 추가하고, `docs/context.md`에는 M6 진행 상태와 검증 결과를 남긴다.

- [x] **2단계: 검증 명령 실행**

실행:

```powershell
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
```

기대 결과: 모든 명령이 통과한다. `next build`가 `.next/types`를 재생성하는 중에 `typecheck`를 동시에 실행해 실패한 경우, build가 끝난 뒤 `typecheck`만 단독으로 다시 실행한다.

- [x] **3단계: 최종 라우트 smoke 확인**

수정 후 최소한 다음 라우트를 다시 연다.

```text
/
/notices
/results
/results/seed-2026
/login
/signup
/mypage
/admin
```

기대 결과: 데스크톱과 모바일 폭에서 client-side exception 없이 렌더링된다.

- [x] **4단계: 커밋**

M6 파일만 stage하고, 무관한 로컬 파일은 남겨둔다.

```powershell
git add docs/qa-m6-ui-polish.md docs/specs.md docs/spec-changelog.md docs/context.md src/app src/components
git commit -m "ui: polish M6 core flows"
```

기대 결과: `.gitignore`, `.playwright-mcp/`, reference 리포트 파일은 사용자가 명시적으로 요청하지 않는 한 커밋하지 않는다.
