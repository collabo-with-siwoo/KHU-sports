---
description: Git Flow 기반 feature 브랜치를 생성하고 작업을 시작합니다
---

# Feature 브랜치 시작

사용법: `/git-feature` 또는 "feature 브랜치 만들어줘"

## 브랜치 네이밍 규칙

마일스톤(M0~M7) 접두어를 반드시 포함합니다:

| 마일스톤 | 브랜치 예시 |
|---------|------------|
| M0 환경 준비 | `feat/m0-project-init` |
| M1 인증·약관 | `feat/m1-auth-signup`, `feat/m1-terms-management` |
| M2 공지 시스템 | `feat/m2-notice-crud`, `feat/m2-tiptap-editor` |
| M3 어드민 RBAC | `feat/m3-admin-rbac`, `feat/m3-admin-invite` |
| M4 선수·대회·스코어 | `feat/m4-score-excel-upload`, `feat/m4-tournament-crud` |
| M5 회원 관리 | `feat/m5-member-lifecycle` |
| M6 UI·QA | `feat/m6-responsive-ui`, `feat/m6-accessibility` |
| M7 베타 출시 | `feat/m7-beta-launch` |

## 워크플로우

1. 현재 브랜치 상태를 확인한다
// turbo
2. `develop` 브랜치가 없으면 `main`에서 생성한다:
   ```bash
   git checkout main && git pull origin main && git checkout -b develop && git push -u origin develop
   ```
// turbo
3. `develop`을 최신으로 업데이트한다:
   ```bash
   git checkout develop && git pull origin develop
   ```
4. 사용자에게 feature 이름을 물어본다 (예: "회원가입 + 약관 동의")
5. 마일스톤 번호 + feature 이름을 kebab-case로 변환하여 브랜치를 생성한다:
   ```bash
   git checkout -b feat/m{N}-{feature-name} develop
   ```
6. 브랜치를 원격에 push한다:
   ```bash
   git push -u origin feat/m{N}-{feature-name}
   ```
7. 생성된 브랜치 정보를 사용자에게 알려준다
