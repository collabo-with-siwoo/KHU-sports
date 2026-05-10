---
description: develop에서 release 브랜치를 생성하고 main에 머지하여 배포합니다
---

# Release (배포)

사용법: `/git-release` 또는 "릴리즈 해줘"

> ⚠️ `main` 머지 시 Vercel 자동 프로덕션 배포 (PRD §8.1)

## 워크플로우

1. 사용자에게 버전 번호를 물어본다 (MVP 전: `0.x.x`, MVP 완료: `1.0.0`)
// turbo
2. develop에서 release 브랜치를 생성한다:
   ```bash
   git checkout develop && git pull origin develop
   git checkout -b release/{version}
   ```
3. package.json version 업데이트
4. 검증:
   ```bash
   npx tsc --noEmit && npx next lint && npx prisma validate
   ```
5. 커밋 및 push:
   ```bash
   git add -A && git commit -m "chore: release v{version}"
   git push -u origin release/{version}
   ```
6. main 머지 + 태그:
   ```bash
   git checkout main && git pull origin main
   git merge --no-ff release/{version} -m "chore: merge release v{version} into main"
   git tag -a v{version} -m "Release v{version}"
   git push origin main --tags
   ```
7. develop 역병합:
   ```bash
   git checkout develop && git merge --no-ff release/{version}
   git push origin develop
   ```
8. release 브랜치 삭제
9. Vercel 배포 확인 + context.md 갱신
