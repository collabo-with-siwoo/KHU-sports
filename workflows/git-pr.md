---
description: 현재 feature 브랜치에 대해 PR(Pull Request)을 생성합니다.
---

# PR 생성

사용법: `/git-pr` 또는 "PR 만들어줘"

## PR 메시지 포맷

```markdown
## 📋 Summary
{feature 브랜치의 목적을 1-2문장으로 요약}

**마일스톤**: M{N} — {마일스톤명}
**PRD 참조**: §{섹션}

## 🔄 Changes
{누적된 커밋 로그를 분석하여 변경사항을 카테고리별로 정리}

### Features
- {새 기능 목록}

### Bug Fixes
- {버그 수정 목록}

### Improvements
- {리팩토링, 성능 개선 등}

### Docs / Config
- {문서, 설정 변경}

## 🛡️ Security Checklist (PRD §11)
- [ ] 권한 체크: 어드민 API에 role 미들웨어 적용
- [ ] 스코어 접근: 본인 외 상세 스코어카드 차단
- [ ] XSS: Tiptap HTML sanitize 처리
- [ ] 파일 업로드: Content-Type/Size 검증
- [ ] 환경변수: 하드코딩 없음

## 🧪 Test Results
- TypeScript: tsc --noEmit ✅
- ESLint: next lint ✅
- Prisma: prisma validate ✅

## ✅ Checklist
- [ ] 코드 리뷰 요청
- [ ] 테스트 통과 확인
- [ ] specs.md 업데이트
- [ ] Breaking change 없음
```

## 워크플로우

1. 현재 브랜치를 확인한다:
   ```bash
   git branch --show-current
   ```
2. 현재 브랜치가 `feat/`, `fix/`, `hotfix/` 중 하나인지 확인한다. 아니면 중단.
// turbo
3. develop 기준으로 이 브랜치의 **모든 누적 커밋**을 수집한다:
   ```bash
   git log develop..HEAD --oneline --no-merges
   ```
// turbo
4. 커밋 로그뿐 아니라 **실제 변경된 파일과 diff**도 분석한다:
   ```bash
   git diff develop...HEAD --stat
   ```
5. 위 정보를 바탕으로 PR 메시지를 자동 생성한다:
   - 커밋의 `type`별로 분류 (feat → Features, fix → Bug Fixes 등)
   - 마일스톤 번호와 PRD 참조 섹션을 자동 추출
   - Security Checklist는 변경된 도메인에 따라 해당 항목만 체크
6. 사용자에게 생성된 PR 메시지를 보여주고 확인을 받는다
7. GitHub CLI로 PR을 생성한다:
   ```bash
   gh pr create --base develop --title "<PR 제목>" --body "<PR 본문>"
   ```
   - `gh` CLI가 없으면 설치를 안내하거나, PR 메시지만 제공
