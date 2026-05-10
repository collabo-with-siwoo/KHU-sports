# CLAUDE.md — KHU Sports 골프대회 홈페이지 Claude 진입점

> **이 파일은 Claude Code CLI가 자동으로 읽는 진입점입니다.**
> **프로젝트**: 경희대학교 골프대회 공식 홈페이지 (PRD v0.3)

---

## 🚨 필수: 세션 시작 전 읽을 파일

1. **`AGENTS.md`** — 프로젝트 아키텍처, 핵심 정책, 필수 프로토콜
2. **`PRD/04_golf_PRD.md`** — 제품 요구사항 정의서 전문

---

## 📦 기술 스택 요약

| 레이어 | 선택 |
|--------|------|
| Frontend + Backend | **Next.js 14+ (App Router)** |
| 호스팅 | **Vercel** (Hobby → Pro 전환) |
| DB | **Supabase (PostgreSQL)** |
| 인증 | **Supabase Auth** |
| ORM | **Prisma** 또는 **Drizzle** |
| 파일 저장 | **Cloudflare R2** (Presigned URL) |
| 공지 에디터 | **Tiptap** (WYSIWYG) |
| 메일 발송 | **Resend** |
| 엑셀 처리 | **SheetJS (xlsx)** |
| 폼 검증 | **zod + react-hook-form** |
| 모니터링 | **Vercel Analytics + Sentry** |

---

## 🛡️ 개발 시 절대 규칙

### 1. 권한 체크 (PRD §6)
- 모든 `/admin` API Route에 **미들웨어로 AdminRole 체크** 필수
- 스코어 API에서 **본인 외 상세 데이터는 반드시 차단** (어드민만 허용)
- 대회 결과 공개 API는 `순위·이름·총타수`만 반환
- 회원 유형 변경(GENERAL↔PLAYER)은 **어드민만** 가능

### 2. 회원가입 · 로그인 (PRD §4.4)
- 회원가입 필드: 아이디(영문+숫자)·이름(한글)·생년월일·성별·비밀번호·전화번호·이메일·주소
- 로그인: **아이디/비밀번호** 방식. 내부적으로 아이디 → 이메일 매핑 후 Supabase Auth 인증
- 가입 시 모든 회원은 **GENERAL** 유형

### 3. 선수 등록 (PRD §4.4.1)
- 선수 등록은 **이메일 접수** 방식: `khusports2026@gmail.com`
- 유저 측: 마이페이지 > "선수 등록하기" > 안내 + 첨부파일 다운로드 > 이메일 접수
- 어드민 측: 이메일 확인 > 회원 관리에서 GENERAL → PLAYER 변경

### 4. 데이터 모델 (PRD §5)
- Prisma 스키마는 PRD §5의 모델을 기준으로 작성
- User 모델에 `username`, `birthDate`, `gender`, `address`, `userType` 필드 포함
- `scoreData`는 **JSONB** (종목별 다른 형식 대응)
- Player와 User는 **분리 유지** (1 User : N Player, 탈퇴 시 익명화)

### 5. 파일 업로드 (PRD §7)
- 이미지: R2 공개 버킷, Presigned PUT, 최대 10MB
- PDF: R2 비공개 버킷, Presigned GET (5분 만료), 최대 50MB
- 영상: 100MB 이하 R2, 이상은 YouTube 임베드

### 6. 약관 시스템 (PRD §4.2.2)
- 어드민이 약관 종류를 자유롭게 추가/비활성 가능
- 회원가입 화면은 **활성 약관만 동적 로드** (코드 변경 없이)
- 동의 이력은 **버전ID·시각·IP** 기록 → 영구 보존

### 7. 회원 라이프사이클 (PRD §4.5)
- `ACTIVE → DORMANT → WITHDRAWN_PENDING → WITHDRAWN_DELETED`
- 탈퇴 시 Player 테이블은 **익명화 보존** (userId=null, name="선수_XXXX")
- GENERAL 회원도 동일한 라이프사이클 적용

### 8. 환경변수 (PRD §3.1)
```
# 절대 코드에 하드코딩 금지. Vercel 환경변수로만 관리
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY
R2_BUCKET_PUBLIC / R2_BUCKET_PRIVATE / R2_PUBLIC_BASE_URL
RESEND_API_KEY
NEXT_PUBLIC_SITE_URL
INITIAL_SUPER_ADMIN_EMAIL
```

### 9. 코드 품질
- TypeScript strict mode
- zod로 모든 API 입력 검증
- sanitize-html로 Tiptap HTML XSS 방지
- Prisma 파라미터 바인딩으로 SQL Injection 차단
- next/image로 이미지 최적화

---

## 🎯 마일스톤 (PRD §9)

| 단계 | 산출물 |
|------|--------|
| **M0** 환경 준비 | Repo, Vercel·Supabase·R2, 도메인, Hello World |
| **M1** 인증·약관 | 회원가입/로그인/약관동의/비밀번호 재설정 |
| **M2** 공지 시스템 | 공지 CRUD (어드민) + 목록·상세 (유저), R2 업로드 |
| **M3** 어드민 RBAC | 슈퍼어드민·멤버·메뉴별 권한, 관리자 초대 |
| **M4** 선수·대회·스코어 | 데이터 모델, 어드민 입력 UI, 공개 조회 |
| **M5** 회원 관리 | 목록·상세·휴면·탈퇴 처리 |
| **M6** UI·QA | 반응형, 접근성, 크로스 브라우저 |
| **M7** 베타 출시 | 비공개 베타 → 피드백 → 공개 |

---

## 📎 참조 파일

- `AGENTS.md` — 프로토콜 및 아키텍처 정의
- `PRD/04_golf_PRD.md` — 제품 요구사항 전문
- `docs/context.md` — 현재 프로젝트 상태
- `docs/specs.md` — 서비스 스펙 명세
- `reference/` — 대회 요강, 동의서, 스코어 엑셀 샘플
