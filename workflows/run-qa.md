---
name: run-qa
description: QA 자동화 테스트를 실행합니다
---

# /run-qa — QA 자동화 실행

> 타입체크 → 린트 → Prisma 검증 → (선택) E2E 테스트 순서로 실행합니다.

## Step 1: 기본 검증 (필수)

// turbo
```bash
npx tsc --noEmit && echo "✅ TypeScript OK"
npx next lint && echo "✅ ESLint OK"
npx prisma validate && echo "✅ Prisma OK"
```

## Step 2: Next.js 빌드 검증 (권장)

```bash
npx next build
```

> 빌드가 성공하면 Vercel 배포 시에도 문제없음을 보장합니다.

## Step 3: PRD 정책 수동 체크리스트

커밋 전 아래 항목을 코드에서 확인합니다:

| 항목 | 확인 방법 |
|------|----------|
| 스코어 접근 제어 | `/api/scores` 엔드포인트에서 본인 외 차단 확인 |
| 어드민 권한 체크 | `/admin` 라우트에 미들웨어 적용 확인 |
| XSS 방지 | Tiptap HTML 출력에 sanitize-html 적용 |
| 파일 업로드 검증 | Presigned URL 발급 시 Content-Type·Size 체크 |
| 환경변수 | 코드에 API 키·시크릿 하드코딩 없음 |
| 약관 동적 로드 | 회원가입 화면이 활성 약관만 로드 |

## Step 4: E2E 테스트 (선택, M6 이후)

Playwright 설정 후 사용 가능:

```bash
npx playwright install chromium
npx playwright test
```

## 빠른 참조

```
npx tsc --noEmit           # TypeScript 타입체크
npx next lint               # ESLint
npx prisma validate         # Prisma 스키마 검증
npx next build              # 프로덕션 빌드 검증
npx playwright test         # E2E 테스트 (M6+)
```
