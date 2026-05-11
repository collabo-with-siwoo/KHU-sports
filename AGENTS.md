# AGENTS.md - KHU Sports 개발 에이전트 지침

> 프로젝트: 경희대학교 골프대회 공식 홈페이지
> 주요 런타임: Next.js App Router, TypeScript, Supabase, Prisma, Cloudflare R2, Resend, Vercel
> 기본 리뷰 URL: `https://khu-sports.vercel.app/`

이 문서는 VS Code, Codex CLI/App, Claude Code 등 코드 에이전트가 이 저장소에서 일할 때 따르는 공통 지침입니다. 지침은 가볍게 시작하되, 보안과 검증은 끝까지 지킵니다.

## 1. 작업 시작 루틴

작업을 시작할 때는 먼저 아래 파일을 짧게 확인합니다.

```bash
Get-Content -Raw docs/context.md
Get-Content -Raw docs/specs.md
Get-Content -Raw PRD/04_golf_PRD.md
```

참고:
- `PRD/04_golf_PRD.md`와 과거 문서 일부는 인코딩이 깨져 있을 수 있습니다. 최신 실행 기준은 `docs/specs.md`, `docs/context.md`, 실제 코드, 사용자 최신 지시를 우선합니다.
- `CLAUDE.md`는 Claude Code용 보조 요약입니다. 충돌하면 이 `AGENTS.md`를 우선합니다.
- `.env`에는 실제 키와 비밀번호가 들어갈 수 있으므로 내용을 출력하거나 커밋하지 않습니다.

## 2. Superpowers 스타일 작업 방식

이 저장소는 Superpowers 플러그인을 로컬 플러그인으로 사용할 수 있게 설정합니다.

- 로컬 플러그인: `plugins/superpowers`
- 로컬 마켓플레이스: `.agents/plugins/marketplace.json`
- Codex에서 플러그인을 설치/활성화한 뒤 관련 skill을 우선 사용합니다.

Superpowers식 기본 흐름:

1. **Brainstorming**: 요구사항이 흐릿하면 바로 구현하지 말고 목표, 사용자, 제약을 짧게 정리합니다.
2. **Plan**: 파일 단위로 작고 검증 가능한 작업 계획을 세웁니다. 단순 작업은 계획을 길게 쓰지 않습니다.
3. **TDD where useful**: 권한, 공개/비공개 DTO, 스코어 상태, 엑셀 다운로드처럼 회귀 위험이 큰 로직은 테스트를 먼저 또는 함께 작성합니다.
4. **Systematic debugging**: 증상만 고치지 말고 재현, 원인, 수정, 회귀 방지 순서로 접근합니다.
5. **Verification before completion**: 완료 선언 전 타입체크, 린트, 테스트, 빌드 중 변경 범위에 맞는 검증을 실행합니다.
6. **Finish cleanly**: 변경 파일, 검증 결과, 남은 리스크를 짧게 보고합니다.

Codex에서 sub-agent를 쓸 수 있더라도 사용자가 명시적으로 병렬 에이전트 작업을 요청하지 않으면 직접 처리합니다.

## 3. 프로젝트 구조

```text
src/
  app/                  Next.js App Router 페이지와 Route Handler
    (auth)/             로그인, 회원가입, 비밀번호 재설정
    admin/              관리자 화면과 보호된 운영 기능
    mypage/             로그인 사용자/선수 개인 화면
    results/            공개 대회 결과와 공개 Scorecard
  components/           공용 UI 컴포넌트
  lib/                  Prisma, Supabase, 인증, 도메인 read/write 로직
  types/                공유 TypeScript 타입
prisma/
  schema.prisma         DB 스키마
docs/
  context.md            현재 진행 상태
  specs.md              최신 서비스 스펙
  spec-changelog.md     스펙 변경 기록
  results-*.md          결과/스코어 설계 문서
```

## 4. 현재 핵심 도메인 규칙

### 인증과 회원

- 로그인은 사용자-facing으로 아이디/비밀번호 방식입니다. 내부적으로는 `User.username -> User.email -> Supabase Auth` 매핑을 사용합니다.
- 가입 직후 회원은 `GENERAL`입니다.
- `PLAYER` 전환은 관리자 승인으로만 처리합니다.
- 관리자 로그인은 Supabase Auth 사용자와 `AdminUser.status = ACTIVE` 프로필이 모두 필요합니다.

### 스코어와 결과 공개

- 공개 결과 페이지는 `/results`와 `/results/[tournamentId]`입니다.
- `/results/[tournamentId]`는 Full Leaderboard와 공개 Scorecard 탭을 제공합니다.
- 공개 페이지에는 경기 기록 필드만 노출합니다: 순위, 선수명, 학교, 참가구분, 성별, 라운드별 스코어, 36홀 합계, 최종순위, 조, 출발시간.
- 공개 페이지와 공개 다운로드는 전화번호, 이메일, 생년월일, 주소, 보호자 연락처, 선수 메모, 관리자 메모, 검수 로그를 절대 반환하지 않습니다.
- 공개 결과에는 `ADMIN_CONFIRMED` 스코어만 반영합니다.
- 선수 마이페이지는 본인 기록만 조회합니다. 본인에게는 `playerMemo`와 제출/반려 상태를 보여줄 수 있지만 `adminMemo`는 보여주지 않습니다.
- 선수 입력 상태는 `NOT_STARTED`, `DRAFT`, `SUBMITTED`, `ADMIN_CONFIRMED`, `ADMIN_REJECTED`를 사용합니다.
- 선수는 `NOT_STARTED`, `DRAFT`, `ADMIN_REJECTED` 상태만 입력/수정할 수 있습니다. `SUBMITTED`와 `ADMIN_CONFIRMED`는 선수에게 읽기 전용입니다.

### 관리자

- 모든 `/admin` 하위 페이지는 `requireAdmin` 또는 `requireAdminPermission` 계열 체크를 사용합니다.
- `SUPER`는 모든 관리자 기능에 접근할 수 있습니다.
- `MEMBER`는 `AdminUser.permissions` JSON에 따라 메뉴별 권한을 확인합니다.
- 개인정보 포함 엑셀 다운로드는 `SUPER` 또는 `privacy.export` 권한만 가능하며 `ExportLog`를 남깁니다.

## 5. 코딩 규칙

- 기존 패턴을 먼저 따릅니다. 새 추상화는 중복이나 복잡도를 실제로 줄일 때만 추가합니다.
- 서버 데이터 접근은 Prisma를 우선 사용하고, 필요한 필드만 `select`합니다.
- 공개 DTO와 My Page/Admin DTO를 분리합니다. 넓게 가져온 뒤 응답에서 지우는 방식은 피합니다.
- Server Actions와 Route Handlers는 입력을 `zod` 등으로 검증합니다.
- 비밀값, connection string, 서비스 롤 키는 코드와 로그에 남기지 않습니다.
- 파일 편집은 작은 단위로 하고, 사용자 변경 사항을 되돌리지 않습니다.
- Windows/PowerShell 환경입니다. 검색은 `rg`를 우선 사용합니다.

## 6. 프론트엔드 UX 규칙

- 앱/도구 화면은 첫 화면에서 실제 기능을 보여줍니다. 불필요한 랜딩 페이지를 만들지 않습니다.
- 운영 도구는 조용하고 밀도 있게 만듭니다. 큰 마케팅 히어로보다 스캔 가능한 표, 필터, 상태, 액션을 우선합니다.
- 선수용 흐름은 모바일에서 먼저 막히지 않아야 합니다.
- 버튼/필터/탭/체크박스는 URL 상태와 서버 필터링을 우선합니다.
- 개인정보가 보일 수 있는 텍스트는 화면뿐 아니라 DTO와 쿼리 단계에서 차단합니다.

## 7. 문서 관리

코드 변경이 서비스 스펙을 바꾸면 다음 문서도 함께 업데이트합니다.

- `docs/specs.md`
- `docs/spec-changelog.md`
- 필요 시 `docs/context.md`

작업 로그는 장기 작업, 배포, DB 변경, 보안 정책 변경처럼 추적 가치가 있을 때만 `docs/agent_session_log.md`와 `docs/agent_discussion.md`에 남깁니다. 작은 문구 수정이나 단순 리팩터는 최종 응답으로 충분합니다.

## 8. 검증 명령

변경 범위에 맞게 아래를 실행합니다.

```bash
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
```

기본 기준:
- 타입/스키마/권한/DTO 변경: `typecheck`, `prisma:validate`, 관련 테스트
- UI 변경: `typecheck`, `lint`, 가능하면 브라우저 확인
- 배포 전/머지 전: `npm test`, `typecheck`, `lint`, `prisma:validate`, `build`

## 9. Git과 작업 안전

- 현재 작업트리에 사용자 변경이 있을 수 있습니다. 관련 없는 변경은 건드리지 않습니다.
- `git reset --hard`, `git checkout -- <file>` 같은 되돌리기 명령은 사용자가 명시적으로 요청하지 않으면 실행하지 않습니다.
- 커밋/푸시는 사용자가 요청했을 때만 합니다.
- 커밋 전에는 변경 파일과 검증 결과를 확인합니다.
