---
description: 현재 feature 브랜치의 작업을 커밋하고 develop에 머지합니다
---

# Feature 브랜치 완료 (develop 머지)

사용법: `/git-finish` 또는 "feature 완료해줘"

## 워크플로우

// turbo
1. 현재 브랜치와 변경 사항을 확인한다:
   ```bash
   git status && git branch --show-current
   ```
2. 현재 브랜치가 `feat/` 접두어인지 확인한다. 아니면 중단하고 사용자에게 알린다.
// turbo
3. 프로젝트 검증을 실행한다:
   ```bash
   npx tsc --noEmit && npx next lint && npx prisma validate
   ```
   - ❌ 에러가 있으면 먼저 수정
// turbo
4. 변경 사항이 있으면 스테이징하고 커밋한다:
   ```bash
   git add -A && git commit -m "{적절한 커밋 메시지}"
   ```
   - 커밋 메시지는 변경 내용을 분석하여 자동으로 작성한다
   - Conventional Commits 형식 사용: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
5. 원격에 push 한다:
   ```bash
   git push origin {current-branch}
   ```
6. develop으로 체크아웃하고 머지한다:
   ```bash
   git checkout develop && git pull origin develop && git merge --no-ff {feature-branch}
   ```
7. develop을 원격에 push 한다:
   ```bash
   git push origin develop
   ```
8. feature 브랜치를 삭제한다 (사용자에게 확인 후):
   ```bash
   git branch -d {feature-branch}
   git push origin --delete {feature-branch}
   ```
9. **docs/context.md** 갱신 — 완료된 마일스톤/기능의 진행 상태를 업데이트한다.
