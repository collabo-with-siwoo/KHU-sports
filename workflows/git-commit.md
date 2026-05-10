---
description: 현재 작업 내용을 커밋합니다 (Conventional Commits 형식)
---

# Git 커밋

사용법: `/git-commit` 또는 "커밋해줘"

## 커밋 메시지 포맷 (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

### type (필수)

| type | 용도 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat(auth): add signup with terms agreement` |
| `fix` | 버그 수정 | `fix(score): prevent unauthorized scorecard access` |
| `refactor` | 리팩토링 (기능 변경 없음) | `refactor(admin): simplify RBAC middleware` |
| `docs` | 문서 변경 | `docs: update PRD to v0.2` |
| `test` | 테스트 추가/수정 | `test(notice): add CRUD integration tests` |
| `chore` | 빌드, 설정, 의존성 등 | `chore: upgrade prisma to v6.x` |
| `style` | 코드 포맷팅 | `style: fix trailing whitespace` |
| `perf` | 성능 개선 | `perf(result): add ISR caching for tournament results` |
| `ci` | CI/CD 설정 | `ci: add GitHub Actions typecheck workflow` |

### scope (선택)

`()` 안에 변경 대상 도메인을 표기합니다:
- 인증: `auth`, `signup`, `login`
- 약관: `terms`, `agreement`
- 공지: `notice`
- 대회: `tournament`, `result`
- 스코어: `score`
- 회원: `member`, `player`
- 어드민: `admin`, `rbac`
- 파일: `upload`, `r2`
- 메일: `email`, `resend`
- 인프라: `db`, `prisma`, `vercel`
- UI: `ui`, `page`

### subject (필수)

- **영문 소문자**로 시작
- **명령형** 사용: "add", "fix", "update" (not "added", "fixed")
- 마침표 없음
- 50자 이내

### body (선택, 여러 줄 변경 시 권장)

```
- Add member signup flow with dynamic terms loading
- Implement score access control (self-only + admin)
- Create Tiptap editor for notice management
```

## 워크플로우

// turbo-all
0. **🔄 Self-Healing Spec Sync** (커밋 전 스펙 동기화):
   - 변경된 코드 파일이 있으면, 해당 도메인의 스펙 문서를 확인하고 불일치 시 즉시 업데이트
   - `docs/spec-changelog.md`에 변경 이력 추가 확인
   - `docs/context.md`의 마일스톤 진행 상태 갱신 확인
   > ⚠️ 이 단계는 에이전트가 **사용자에게 묻지 않고 자동으로** 수행해야 합니다.

1. **프로젝트 검증** (커밋 전):
   ```bash
   npx tsc --noEmit && npx next lint && npx prisma validate
   ```
   - ❌ 에러가 있으면 먼저 수정한 후 다시 시도

2. 변경 사항을 확인한다:
   ```bash
   git status && git diff --stat
   ```
3. 변경된 파일의 diff를 분석하여 적절한 커밋 메시지를 자동 작성한다
4. 하나의 커밋으로 스테이징하고 커밋한다:
   ```bash
   git add -A && git commit -m "<자동 생성된 메시지>"
   ```
5. 원격에 push 한다:
   ```bash
   git push origin $(git branch --show-current)
   ```

## 예시

### 단일 변경
```
feat(auth): add signup with email verification and terms consent
```

### 복합 변경
```
feat(score): implement score management system

- Add Excel upload with SheetJS (xlsx template download)
- Create manual score input form with zod validation
- Implement self-only scorecard access control
- Add admin view for all player scores

Refs: PRD §4.3
```
