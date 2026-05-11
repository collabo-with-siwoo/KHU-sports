# CLAUDE.md - KHU Sports Claude Code 지침

이 파일은 Claude Code에서 이 저장소를 열었을 때 빠르게 읽기 위한 보조 지침입니다. 공통 규칙의 원본은 `AGENTS.md`입니다.

## 먼저 읽을 파일

```bash
Get-Content -Raw AGENTS.md
Get-Content -Raw docs/context.md
Get-Content -Raw docs/specs.md
```

`PRD/04_golf_PRD.md`는 원본 PRD이지만 일부 인코딩이 깨져 있을 수 있습니다. 최신 구현 기준은 `docs/specs.md`, `docs/context.md`, 실제 코드, 사용자 최신 지시입니다.

## Superpowers 사용

이 프로젝트는 Superpowers 스타일 워크플로우를 사용합니다.

- 요구사항이 흐리면 `brainstorming`으로 목표와 제약을 정리합니다.
- 구현 계획이 필요한 크기라면 `writing-plans` 방식으로 파일 단위 작업을 나눕니다.
- 권한, 공개/비공개 데이터 경계, 스코어 상태, 엑셀 다운로드처럼 회귀 위험이 큰 부분은 테스트를 먼저 또는 함께 작성합니다.
- 버그는 `systematic-debugging` 방식으로 재현, 원인, 수정, 검증 순서로 접근합니다.
- 완료 전에는 `verification-before-completion` 원칙으로 실제 검증 결과를 확인합니다.

Claude Code에서 공식 Superpowers 플러그인을 사용할 수 있다면 해당 skill을 우선 호출합니다. 사용할 수 없다면 `AGENTS.md`의 Superpowers 스타일 절차를 수동으로 따릅니다.

## 프로젝트 요약

- Next.js App Router + TypeScript
- Supabase Auth + Supabase PostgreSQL
- Prisma ORM
- Cloudflare R2 파일 저장 예정
- Resend 이메일 예정
- Vercel 배포

주요 경로:

- 공개: `/`, `/notices`, `/results`, `/results/[tournamentId]`
- 인증: `/login`, `/signup`, `/reset-password`
- 마이페이지: `/mypage`, `/mypage/scores`, `/mypage/scores/[tournamentId]`
- 선수 스코어 입력: `/mypage/scores/[tournamentId]/input/round/[round]`
- 관리자: `/admin`, `/admin/tournaments`, `/admin/scores`, `/admin/members`, `/admin/admins`

## 절대 지킬 보안 경계

- `.env`와 서비스 키를 출력하거나 커밋하지 않습니다.
- 공개 결과/Scorecard/공개 엑셀은 개인정보를 반환하지 않습니다.
- 공개 결과는 `ADMIN_CONFIRMED` 스코어만 반영합니다.
- My Page는 `session.user.id`로 연결된 본인 `Player` 기록만 보여줍니다.
- My Page에는 `playerMemo`와 반려 사유를 보여줄 수 있지만 `adminMemo`와 검수 로그는 보여주지 않습니다.
- `/admin`은 Supabase 세션과 `AdminUser` 권한을 모두 확인합니다.

## 개발 원칙

- 기존 코드 패턴을 먼저 따릅니다.
- DTO를 분리하고 필요한 필드만 `select`합니다.
- 사용자 변경을 되돌리지 않습니다.
- 새 기능은 작은 단위로 구현하고, 검증 가능한 상태에서 멈춥니다.
- 문서가 코드와 달라지면 `docs/specs.md`와 `docs/spec-changelog.md`를 업데이트합니다.

## 검증 명령

```bash
npm run typecheck
npm run lint
npm run prisma:validate
npm test
npm run build
```

배포/머지 전에는 위 명령을 가능한 한 모두 통과시킵니다.
