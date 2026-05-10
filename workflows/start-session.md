---
description: 모든 작업 시작 전 세션 로그를 자동 생성합니다. 이 워크플로우는 코드 작업의 전제 조건입니다.
---

# /start-session — 세션 초기화

> **⚠️ 모든 코드 작업 전에 이 워크플로우를 먼저 실행해야 합니다.**
> 사용자가 작업을 요청하면, 코드를 수정하기 **전에** 이 워크플로우를 실행하세요.

## 실행 조건

- 사용자가 코드 수정, 기능 추가, 버그 수정, 테스트 작성 등 **코드 변경을 수반하는 작업**을 요청한 경우
- 새로운 작업 세션이 시작될 때 (이전 작업과 다른 주제)
- 단순 질문이나 파일 읽기만 하는 경우는 **제외**

## Steps

// turbo
1. **PRD 숙지** — PRD 핵심 정보를 확인합니다.

```bash
head -50 PRD/04_golf_PRD.md
```

// turbo
2. **현재 프로젝트 상태 확인** — `docs/context.md` 상위 30줄을 읽습니다.

```bash
head -30 docs/context.md 2>/dev/null || echo "context.md 없음 — 새로 생성 필요"
```

// turbo
3. **최신 스펙 확인** — `docs/specs.md` 상위 30줄을 읽습니다.

```bash
head -30 docs/specs.md 2>/dev/null || echo "specs.md 없음 — PRD 기반으로 생성 필요"
```

// turbo
4. **오늘 세션 존재 확인** — `docs/agent_session_log.md`에 오늘 날짜 블록이 있는지 확인합니다.

```bash
TODAY=$(date +%Y-%m-%d)
if [ -f docs/agent_session_log.md ] && grep -q "$TODAY" docs/agent_session_log.md; then
  echo "✅ 오늘 날짜 세션이 이미 존재합니다. 기존 세션에 추가합니다."
else
  echo "📝 새 세션 블록을 생성해야 합니다."
fi
```

// turbo
5. **현재 마일스톤 판별** — 현재 작업이 어느 마일스톤(M0~M7)에 해당하는지 파악합니다.

> PRD §9 마일스톤 참조:
> - **M0**: 환경 준비 (Repo, Vercel·Supabase·R2, 도메인)
> - **M1**: 인증·약관 (회원가입/로그인/약관동의)
> - **M2**: 공지 시스템 (CRUD + R2 업로드)
> - **M3**: 어드민 RBAC (권한·관리자 초대)
> - **M4**: 선수·대회·스코어 (데이터 모델, 입력 UI)
> - **M5**: 회원 관리 (휴면·탈퇴)
> - **M6**: UI·QA (반응형, 접근성)
> - **M7**: 베타 출시

// turbo
6. **작업 브랜치 생성** — develop 최신 상태에서 새 작업 브랜치를 생성합니다.

```bash
CURRENT=$(git branch --show-current)
echo "현재 브랜치: $CURRENT"
echo "→ develop 기반으로 새 브랜치를 생성합니다."
# git checkout develop && git pull origin develop && git checkout -b {브랜치명}
```

> ⚠️ 브랜치명은 마일스톤 + 작업 성격에 따라 결정합니다:
> - 기능 개발: `feat/m{N}-{feature-name}` (예: `feat/m1-auth-signup`)
> - 버그 수정: `fix/m{N}-{description}`
> - 긴급 수정: `hotfix/{description}`

7. **`docs/agent_session_log.md`에 세션 블록 추가** — 아래 형식을 따릅니다.

   ```markdown
   ---

   ## {오늘 날짜} 세션: {작업 제목}

   **마일스톤**: M{N} — {마일스톤명}
   **참여**: Antigravity Agent

   > **사용자 요청**: {요청 요약}
   ```

// turbo
8. **세션 블록 확인**

```bash
tail -10 docs/agent_session_log.md
```

9. **이제 코드 작업을 시작합니다.**

---

## 작업 완료 시 체크리스트

```
✅ 1. context.md 현재 상태 갱신 (마일스톤 진행률 포함)
✅ 2. specs.md 스펙 반영 (코드 변경 시)
✅ 3. spec-changelog.md 이력 기록 (코드 변경 시)
✅ 4. agent_session_log.md 세션 결론 추가
✅ 5. git add -A && git commit
```
