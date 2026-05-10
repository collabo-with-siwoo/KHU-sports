---
description: Vercel 배포 상태를 확인하고 환경변수를 관리합니다
---

# /deploy — Vercel 배포 관리

사용법: `/deploy` 또는 "배포 상태 알려줘"

> PRD §8.1 기준: main 머지 → Vercel 자동 프로덕션 배포

## 배포 환경 (PRD §8.1)

| 환경 | 트리거 | URL |
|------|--------|-----|
| Production | `main` 머지 | 도메인주소.com |
| Preview | PR 생성 | 임시.vercel.app |
| Local | 개발자 로컬 | localhost:3000 |

## 워크플로우

### 배포 상태 확인
```bash
# Vercel CLI가 설치되어 있는 경우
npx vercel ls --limit 5
```

### 로컬 개발 서버
```bash
npm run dev
```

### 프로덕션 빌드 테스트
```bash
npm run build && npm run start
```

## 환경변수 체크리스트 (PRD §3.1)

Vercel에 등록해야 할 환경변수:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Cloudflare R2
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_PUBLIC
R2_BUCKET_PRIVATE
R2_PUBLIC_BASE_URL

# 메일
RESEND_API_KEY

# 기타
NEXT_PUBLIC_SITE_URL
INITIAL_SUPER_ADMIN_EMAIL
```

## Hobby → Pro 전환 기준 (PRD §10.3)

- 월 대역폭 80GB 도달
- 월 함수 호출 80K 도달
- 공식 운영 전환 시점
