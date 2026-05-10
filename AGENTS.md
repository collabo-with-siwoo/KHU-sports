# AGENTS.md — KHU Sports 골프대회 홈페이지 Agent Instructions

> **프로젝트**: 경희대학교 골프대회 공식 홈페이지
> **PRD 참조**: `PRD/04_golf_PRD.md` (v0.3)
> **기술 스택**: Next.js 14+ (App Router) · Supabase · Cloudflare R2 · Prisma · Tiptap · Resend

---

## 🚨 ABSOLUTE FIRST STEP — 세션 시작 시 반드시 실행

**어떤 작업을 시작하기 전에, 아래 단계를 순서대로 수행합니다.**
**이 단계를 건너뛰면 모든 작업이 무효 처리됩니다.**

### Step 0: PRD 숙지
```
cat PRD/04_golf_PRD.md    # 제품 요구사항 전문 — 반드시 숙지
```

### Step 1: 프로젝트 규칙 확인
```
cat CLAUDE.md             # Claude 전용 규칙 + 기술 스택 가이드
```

### Step 2: 현재 상태 파악
```
cat docs/context.md       # 현재 프로젝트 상태 (진행 중인 마일스톤, 최근 변경)
```

### Step 3: 최신 스펙 확인
```
cat docs/specs.md         # 데이터 모델, API 엔드포인트, 확정 정책
```

---

## 🏗️ 프로젝트 아키텍처

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── (public)/         # 유저 뷰 (메인홈, 공지, 대회결과, 마이페이지)
│   ├── (auth)/           # 인증 (회원가입, 로그인, 비밀번호 재설정)
│   ├── admin/            # 어드민 뷰 (대시보드, 공지관리, 회원관리, 스코어관리, 약관관리)
│   └── api/              # API Routes (Server Actions 우선)
├── components/           # 공유 컴포넌트
├── lib/                  # 유틸리티, DB 클라이언트, 인증 헬퍼
├── prisma/               # Prisma 스키마 + 마이그레이션
└── types/                # TypeScript 타입 정의
```

### 핵심 도메인 (PRD §4 기준)

| 도메인 | 파일 위치 | 설명 |
|--------|----------|------|
| **인증** | `(auth)/`, `lib/auth/` | 회원가입·로그인·비밀번호 재설정 (Supabase Auth) |
| **약관** | `admin/terms/`, `(auth)/signup/` | 어드민 직접 작성, 동적 로드, 동의 이력 보관 |
| **공지** | `(public)/notices/`, `admin/notices/` | Tiptap WYSIWYG, R2 이미지·첨부, 카테고리 |
| **대회** | `(public)/results/`, `admin/tournaments/` | 대회 등록·결과 공개 (순위·이름·총타수) |
| **스코어** | `admin/scores/`, `(public)/mypage/` | 수기 + 엑셀 업로드, 본인만 상세 조회 |
| **회원** | `admin/members/`, `(public)/mypage/` | 휴면·탈퇴 라이프사이클, 익명화 |

---

## 🚨 MANDATORY PROTOCOL — 모든 작업에 예외 없이 적용

### Pre-Task (작업 시작 전)
1. **`/start-session` 워크플로우 실행** — `docs/agent_session_log.md`에 세션 블록 생성
2. PRD §9 마일스톤 기준으로 현재 작업이 어느 단계(M0~M7)인지 파악

### During-Task (작업 중)
3. 작업 로그를 `docs/agent_session_log.md`에 실시간 기록
4. 중요 결정은 `docs/agent_discussion.md`에 기록
5. **[필수 루틴]** 당장 처리하지 않는 이슈/아이디어 발견 시 → 사용자에게 "docs/backlog/에 기록해둘까요?" 확인

### Post-Task (작업 완료 후)
6. 종료 체크리스트:
   - `docs/agent_session_log.md` — 세션 결론 추가
   - `docs/agent_discussion.md` — 완료 보고
   - `docs/context.md` — 현재 상태 갱신 (마일스톤 진행률 포함)
   - `docs/specs.md` + `docs/spec-changelog.md` — 스펙/코드 변경 시 자동 반영
7. **[필수 루틴]** 코드가 단 한 줄이라도 수정되었다면, **사용자에게 묻지 말고** 즉시 `docs/specs.md`와 `docs/spec-changelog.md`를 업데이트

### Verification (검증)
8. 커밋 전 검증:
   ```bash
   npx tsc --noEmit              # TypeScript 타입체크
   npx next lint                 # ESLint
   npx prisma validate           # Prisma 스키마 검증
   ```

---

## ⚡ 핵심 정책 요약 (PRD 발췌)

> 아래는 개발 시 절대 위반하면 안 되는 확정 정책입니다.

| 정책 | 규칙 |
|------|------|
| 회원가입 | 아이디(영문+숫자)·이름·생년월일·성별·전화번호·이메일·주소 + 약관 동의 |
| 로그인 | **아이디/비밀번호** 방식 (내부 Supabase Auth는 이메일 매핑) |
| 회원 유형 | **GENERAL**(일반 가입자) / **PLAYER**(선수) — 어드민만 변경 가능 |
| 선수 등록 | 이메일(khusports2026@gmail.com) 접수 → 어드민 승인 → PLAYER 전환 |
| 스코어 조회 | **본인 외 상세 스코어카드 조회 불가** (어드민만 가능) |
| 대회 결과 공개 | 순위·이름·총타수까지만 공개, 상세 스코어카드는 본인만 |
| 휴면 | 1년 미접속 → 자동 휴면, 30일 전 안내 메일 (법정 의무) |
| 탈퇴 | 30일 유예 → 개인정보 삭제, 스코어는 **익명화 보존** |
| 약관 관리 | 어드민이 Tiptap으로 직접 작성·버전 발행, 종류 자유 추가 |
| 파일 업로드 | R2 Presigned URL, Content-Type·Size 검증 |
| 환경변수 | **코드에 하드코딩 절대 금지**, Vercel 환경변수로만 관리 |

---

## 📎 참조 파일

| 파일 | 용도 |
|------|------|
| `PRD/04_golf_PRD.md` | 제품 요구사항 정의서 (v0.2) |
| `CLAUDE.md` | Claude 에이전트 전용 규칙 |
| `docs/context.md` | 현재 프로젝트 상태 |
| `docs/specs.md` | 서비스 스펙 명세 (데이터 모델, API) |
| `docs/spec-changelog.md` | 스펙 변경 이력 |
| `docs/agent_session_log.md` | 에이전트 세션 로그 |
| `docs/agent_discussion.md` | 의사결정 기록 |
| `reference/` | 대회 요강, 동의서, 스코어 엑셀 참고자료 |
