# 04. PRD — 경희대학교 골프대회 홈페이지

> 작성일: 2026-05-10
> 최종 수정: 2026-05-10 (v0.3)
> 작성자: mena@bemyfriends.com
> 상태: Draft **v0.3**
> 호스팅: **Vercel Hobby (시작) → Pro 전환 + Supabase + Cloudflare R2**
>
> **v0.3 주요 변경**
> - 회원가입 필드 확장: 아이디(영문+숫자)·이름(한글)·생년월일·성별·비밀번호·전화번호·이메일·주소
> - 로그인 방식: 이메일 → **아이디/비밀번호** 로 변경 (내부 Supabase Auth는 이메일 매핑)
> - 회원 유형 도입: **일반 가입자(GENERAL) / 선수(PLAYER)** — 어드민만 변경 가능
> - 선수 등록 흐름: 가입 후 "선수 등록하기" → 안내 페이지 → khusports2026@gmail.com 이메일 접수
> - 주민등록번호 → **생년월일**로 대체 (개인정보보호법 §24조의2 준수)
>
> **v0.2 주요 변경**
> - 본인 외 스코어 조회 불가 정책 확정 (어드민만 모든 선수 조회)
> - 유저뷰: 선수 목록·상세 페이지 제거 → 마이페이지·대회 결과로 분리
> - 회원 라이프사이클 정책 명시 (휴면 1년, 탈퇴 30일 유예 후 삭제 + 익명화)
> - 약관 변경 처리 가이드 (정보통신망법 §15 기준) 어드민 페이지에 명시
> - 공지 에디터: Tiptap WYSIWYG 확정
> - 스코어 입력: 엑셀 업로드 병행 확정
> - 이메일 발송: Resend 정책·도메인 SPF/DKIM 명시
> - 자동 약관 공지·재동의 모달은 backlog
> - **약관 관리: 어드민이 본문 직접 작성 + 약관 종류 자유 추가 가능 구조로 설계**

---

## 1. 개요

### 1.1 제품 정의
경희대학교 골프대회 공식 홈페이지. 선수·이해관계자가 대회 공지를 확인하고 선수별 기록을 조회하며, 관리자(1~2명)가 공지·회원·스코어를 관리하는 웹 서비스.

### 1.2 핵심 가치
1. **공식 정보 채널**: 대회 공지·일정·결과를 한 곳에서
2. **기록의 자산화**: 선수별 누적 스코어와 승률을 영구 보존·조회
3. **다종목 확장 가능**: 골프 → 리듬체조 → 농구 등으로 확장하는 기반

### 1.3 목표 (Goals)
- 선수가 자기 기록을 30초 안에 조회
- 관리자가 공지 1건을 5분 안에 등록 (이미지·첨부 포함)
- 관리자가 대회 스코어를 1시간 안에 일괄 입력
- DAU 500 안정 운영

### 1.4 비목표 (Non-Goals)
- ❌ 결제·등록비 처리 (1차 범위 외)
- ❌ 실시간 라이브 스코어링 (대회 중 실시간 업데이트)
- ❌ 모바일 앱 (반응형 웹으로 충분)
- ❌ 외부 토너먼트 연동 (KGA 등)

---

## 2. 사용자

### 2.1 페르소나

| 페르소나 | 비중 | 핵심 니즈 |
|---|---|---|
| **선수** (Primary) | 60% | 자기 기록 조회, 대회 공지 확인 |
| **이해관계자** (Secondary) | 35% | 학부모·코치·관계자. 공지 확인, 선수 기록 조회 |
| **관리자** (Admin) | 5% (1~2명) | 공지 등록, 회원 관리, 스코어 입력 |

### 2.2 트래픽
- DAU 500
- 피크 시간대: 대회 직후 결과 발표 시점 (수배 spike 가능)
- 동시 접속 피크: ~50

---

## 3. 기술 스택

| 레이어 | 선택 | 사유 |
|---|---|---|
| Frontend + Backend | **Next.js 14+ (App Router)** | SSR/SEO, Vercel 최적화 |
| 호스팅 | **Vercel Hobby (시작) → Pro 전환 예정** | GitHub 자동 배포. Hobby로 시작 후 한도 근접 시 Pro 업그레이드 (요금제만 변경, 코드 변경 0) |
| DB | **Supabase (PostgreSQL)** | 무료 티어 시작, 다종목 확장에 JSONB 강함 |
| 인증 | **Supabase Auth** | 회원가입/로그인/비밀번호 재설정 즉시 사용 |
| 파일 저장 | **Cloudflare R2** | egress 무료, Presigned URL 지원 |
| 긴 영상 | **YouTube 임베드** | 호스팅 비용 절약 |
| ORM | **Prisma** 또는 **Drizzle** | 타입 안전, 마이그레이션 |
| 폼 검증 | **zod + react-hook-form** | 약관·회원가입 폼 |
| 공지 에디터 | **Tiptap** (WYSIWYG) | 비개발자 어드민용. 워드처럼 입력 |
| 메일 발송 | **Resend** | 도메인 기반 발송, 3K/월 무료 |
| 엑셀 처리 | **SheetJS (xlsx)** | 스코어 엑셀 업로드/템플릿 |
| 이미지 최적화 | **next/image** | Vercel 빌트인 |
| CI | **GitHub Actions** | 타입체크/린트/테스트 |
| 모니터링 | **Vercel Analytics + Sentry** | 트래픽·에러 추적 |

### 3.1 환경변수 (Vercel에 등록)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # 서버 전용

# Cloudflare R2 (S3 호환)
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_PUBLIC               # 공지 이미지·짧은 영상
R2_BUCKET_PRIVATE              # 첨부 PDF
R2_PUBLIC_BASE_URL             # 공개 버킷 CDN URL

# 메일 (관리자 초대·비밀번호 재설정)
RESEND_API_KEY                 # 또는 Supabase 내장 메일

# 기타
NEXT_PUBLIC_SITE_URL
```

---

## 4. 기능 요구사항

### 4.1 유저 뷰

| 화면 | 기능 | 우선순위 |
|---|---|---|
| 메인홈 | 최신 공지 3건 + 다가오는 대회 + 최근 대회 결과 요약 | P0 |
| 회원가입 | 아이디(영문+숫자)/비밀번호 + 이름·생년월일·성별·전화번호·이메일·주소 + 약관동의 | P0 |
| 로그인 | 아이디/비밀번호, 비밀번호 재설정 | P0 |
| 약관 | 이용약관·개인정보 처리방침 페이지 (버전 관리) | P0 |
| 대회 공지 목록 | 페이지네이션, 검색, 카테고리 필터 | P0 |
| 대회 공지 상세 | 제목/내용/이미지/첨부파일 다운로드 | P0 |
| 대회 결과 목록 | 종료된 대회 리스트 (날짜·이름·종목) | P0 |
| 대회 결과 상세 | **공개**: 순위·이름·총타수만. 상세 스코어카드는 비공개 | P0 |
| 마이페이지 | 본인 정보 수정, 비밀번호 변경, 회원 탈퇴 | P0 |
| 마이페이지 - 내 기록 | **선수(PLAYER)만**: 참가 대회 목록 + 스코어카드 상세 + 누적 승률 | P0 |
| 선수 등록 신청 | 선수 등록 안내 + 첨부파일 다운로드 + **khusports2026@gmail.com** 이메일 접수 안내 | P0 |

> **중요 정책**:
> - 가입 직후 모든 회원은 **일반 가입자(GENERAL)**. 선수 등록은 이메일 접수 → 어드민 승인 후 PLAYER로 전환.
> - 다른 선수의 상세 스코어카드는 어드민만 조회 가능. 일반 유저는 대회 순위·이름·총타수까지만 노출.
> - GENERAL 유형 회원이 "내 기록"에 접근 시 "선수 등록이 필요합니다" 안내.

### 4.2 어드민 뷰 (`/admin`)

| 화면 | 기능 | 우선순위 |
|---|---|---|
| 어드민 로그인 | 별도 로그인 (또는 본 사이트 로그인 + 권한 체크) | P0 |
| 대시보드 | 가입자 수·공지 수·다음 대회 요약 | P1 |
| 공지 관리 | 등록/수정/삭제, **Tiptap WYSIWYG 에디터** (이미지 붙여넣기·표·목록), 첨부 업로드 | P0 |
| 회원 관리 | 목록·검색, 상세, **일반/선수 유형 변경**, 휴면/탈퇴 처리 — **운영 가이드 페이지 명시** | P0 |
| 대회 관리 | 대회 등록 (일정/장소/종목/라운드 수) | P0 |
| 스코어 관리 | 대회별 선수 스코어 입력 (**수기 + 엑셀 업로드 병행**), 모든 선수 스코어카드 조회 | P0 |
| 선수 관리 | 선수 등록·정보 수정 (= 회원의 선수 프로필 부분), 모든 선수 기록 열람 | P0 |
| 관리자 관리 | 슈퍼어드민이 멤버 초대 (이메일), 권한 부여 | P0 |
| 약관 관리 | **약관 항목 자유 추가/수정/비활성**, 버전별 본문 직접 작성 (Tiptap 에디터), 동의 이력 조회, **법적 운영 가이드 페이지 명시** | P0 |

### 4.2.1 어드민 운영 가이드 페이지 (필수 기능)

어드민 화면 내 헬프/가이드로 다음 내용 명시 (운영자가 법적 의무 헷갈리지 않도록):

**(a) 회원 탈퇴·휴면 처리 가이드**
- 휴면: 1년 미접속 시 자동 휴면. 휴면 30일 전 안내 메일 발송 (정보통신망법)
- 탈퇴: 즉시 비활성 → 30일 유예 (복구 가능 기간) → 30일 후 개인정보 완전 삭제
- 스코어 기록은 익명화하여 보존 (학교 공식 기록 목적)

**(b) 약관 변경 가이드** (정보통신망법 §15 기준)
- **일반 변경** (이용자에게 불리하지 않음): 적용일 **7일 전** 공지 의무
- **불리한 변경** (개인정보 항목 추가, 보관기간 연장 등): **30일 전** 공지 + **명시적 재동의** 필요
- 공지 방법: 사이트 배너·이메일 공지 (※ 공지 자동화 기능은 backlog)

### 4.2.2 약관 관리 사양 (어드민 직접 작성)

**기본 시드** (설치 시 자동 생성):
- 이용약관 (필수, slug: `terms`)
- 개인정보 처리방침 (필수, slug: `privacy`)
- 마케팅 수신 동의 (선택, slug: `marketing`)

**어드민이 할 수 있는 것**
- **새 약관 추가**: 슬러그·제목·필수 여부·노출 순서 입력 (예: 위치정보 동의, 제3자 정보제공 등)
- **약관 본문 작성·수정**: Tiptap 에디터로 직접 입력 (헤딩·목록·표·링크 지원)
- **새 버전 발행**: 본문 수정 시 새 버전(예: `1.0` → `1.1`)으로 발행, 적용일 지정
- **이전 버전 보존**: 과거 버전은 회원이 동의했던 시점 증빙용으로 영구 보존
- **활성/비활성 토글**: 더 이상 받지 않는 약관은 비활성 처리 (기존 동의 이력은 유지)
- **미리보기**: 회원가입 화면에 어떻게 보일지 미리 확인
- **동의 이력 조회**: 어느 회원이 어떤 버전에 언제 동의했는지

**시스템 동작**
- 회원가입 화면은 **활성 상태인 약관만 자동 노출** (코드 변경 없이 약관 추가/제거 가능)
- 필수 약관은 모두 동의해야 가입 진행
- 회원가입 시 동의한 모든 약관의 **버전 ID·시각·IP** 기록 → 추후 분쟁 대비 증빙
- 새 버전 발행 후 적용일 도달 시 → 어드민 운영 가이드(§4.2.1)에 따라 사이트 배너·이메일 안내 (※ 자동화는 backlog)

### 4.3 스코어 엑셀 업로드 사양

| 항목 | 내용 |
|---|---|
| 형식 | xlsx (Excel) — 템플릿 다운로드 제공 |
| 컬럼 (골프) | `player_email`, `round`, `front_9`, `back_9`, `total`, `notes` |
| 검증 | 회원 이메일 일치 확인, 총타수 = 전·후반 합 검증, 파일 단위 트랜잭션 |
| 결과 | 성공·실패 row 리포트, 부분 실패 시 전체 롤백 옵션 |
| 종목 확장 | 종목별 템플릿 다른 컬럼 (Phase 2) |

### 4.4 회원가입 흐름

**입력 항목:**

| 필드 | 규칙 | 필수 |
|------|------|------|
| 아이디 | 영문+숫자, 4~20자, 중복 불가 | ✅ |
| 비밀번호 | 8자 이상, 영문+숫자+특수문자 포함 | ✅ |
| 이름 | 한글, 2~10자 | ✅ |
| 생년월일 | YYYY-MM-DD 형식 | ✅ |
| 성별 | 남/여 | ✅ |
| 전화번호 | 010-XXXX-XXXX 형식 | ✅ |
| 이메일 | 유효한 이메일 형식 | ✅ |
| 주소 | 도로명/지번 주소 | ✅ |

**가입 절차:**

1. 회원가입 화면에서 위 항목 입력
2. **활성 상태(`AgreementTemplate.active = true`) 약관 목록을 동적 로드**
3. `displayOrder`에 따라 정렬, 각 약관별 최신 버전 본문 표시
4. 사용자는 각 약관에 대해 동의/거부 선택 (필수 약관은 거부 시 가입 불가)
5. 만 14세 이상 확인 (필수, 약관과 별개 시스템 체크)
6. 동의 완료 시 `UserAgreement`에 동의한 각 버전의 `agreementVersionId` + 시각 + IP 기록
7. 가입 완료 시 **일반 가입자(GENERAL)** 유형으로 등록

> **로그인 방식**: 아이디/비밀번호. 내부적으로 아이디 → 이메일 매핑 후 Supabase Auth 인증.
> **약관 자동 반영**: 어드민이 새 약관을 추가하면 회원가입 화면에 자동 반영. 코드 변경 불필요.

### 4.4.1 선수 등록 흐름

가입 직후 모든 회원은 **일반 가입자(GENERAL)**입니다. 선수로 활동하려면 별도 등록 절차가 필요합니다.

**유저 측 흐름:**
1. 로그인 후 마이페이지에서 **"선수 등록하기"** 버튼 클릭
2. 선수 등록 안내 페이지 표시:
   - 선수 등록 절차 설명
   - 필요 서류 첨부파일 다운로드 (서약서, 동의서 등)
   - **`khusports2026@gmail.com`** 으로 서류를 이메일 접수하라는 안내
3. 선수가 직접 이메일 작성·발송

**어드민 측 흐름:**
1. 이메일로 접수된 서류 확인
2. 어드민 > 회원 관리 > 해당 회원 검색
3. 회원 유형을 **일반(GENERAL) → 선수(PLAYER)**로 변경
4. 선수 프로필(Player) 자동 생성

> **회원 유형**: `GENERAL`(일반 가입자) / `PLAYER`(선수). 어드민만 변경 가능.

### 4.5 회원 라이프사이클 정책

| 상태 | 진입 조건 | 처리 |
|---|---|---|
| **ACTIVE** | 가입 직후 | 정상 이용 |
| **DORMANT** (휴면) | **1년** 미접속 | 로그인 시도 시 휴면 해제 안내, 본인 인증 후 재활성 |
| **WITHDRAWN_PENDING** | 탈퇴 신청 | **30일 유예** — 복구 요청 시 ACTIVE 복구 |
| **WITHDRAWN_DELETED** | 탈퇴 후 30일 경과 | 개인정보 완전 삭제 (이름·이메일·전화·생년) |

### 4.5.1 휴면 정책 상세
- 마지막 로그인 후 **335일(11개월 5일)** 시점에 안내 메일 발송 (휴면 30일 전 고지 = 법정 의무)
- 365일 도달 시 자동 휴면 전환
- 휴면 계정은 별도 보관, 일반 회원 목록에서 제외
- 복구 절차: 본인 이메일 인증

### 4.5.2 탈퇴 정책 상세
- 탈퇴 신청 즉시 → `WITHDRAWN_PENDING` 상태, 로그인 차단
- 30일 내 복구 요청 가능 (메일 또는 어드민 문의)
- 30일 경과 → 개인정보 마스킹·삭제, 상태 `WITHDRAWN_DELETED`
- **스코어·대회 기록은 익명화하여 보존**:
  - `Player.userId` → null
  - `Player.name` → "선수_XXXX" 같은 익명 식별자
  - 대회 기록·통계는 학교 공식 기록으로 유지

### 4.6 이메일 발송 정책

| 시점 | 메일 내용 | 의무 |
|---|---|---|
| 회원가입 직후 | 이메일 인증 링크 (24시간 만료) | 권장 |
| 비밀번호 찾기 | 재설정 링크 (30분 만료) | 필수 |
| 관리자 초대 | 가입 토큰 링크 (72시간 만료) | 필수 |
| 휴면 30일 전 | 휴면 전환 안내 | **법정 의무** |
| 탈퇴 완료 | 탈퇴 확인 메일 | 권장 |
| 약관 변경 시 | 변경 안내 (※ 자동화는 backlog) | 법정 의무 |

**발송 인프라**: Resend ($0/월, 3,000건 무료)
**발송 도메인**: `noreply@<도메인>` — SPF/DKIM/DMARC 설정 필수 (Resend 가이드 따라 DNS에 TXT 레코드 추가, 스팸함 방지)

---

## 5. 데이터 모델 (초안)

```prisma
// ============ 사용자 ============
model User {
  id              String   @id @default(uuid())
  username        String   @unique  // 아이디 (영문+숫자, 4~20자)
  email           String   @unique
  name            String             // 이름 (한글)
  phone           String             // 전화번호 (필수)
  birthDate       DateTime           // 생년월일
  gender          Gender             // 성별 (MALE | FEMALE)
  address         String?            // 주소
  userType        UserType @default(GENERAL) // 일반 가입자 / 선수
  status          UserStatus @default(ACTIVE)
  // ACTIVE | DORMANT | WITHDRAWN_PENDING | WITHDRAWN_DELETED
  lastLoginAt     DateTime?
  dormantAt       DateTime?         // 휴면 전환 시각
  withdrawnAt     DateTime?         // 탈퇴 신청 시각 (+30일 후 삭제)
  createdAt       DateTime @default(now())
  agreements      UserAgreement[]
  players         Player[]          // 종목별 선수 프로필 (1 user : N sports)
  // Supabase Auth와 1:1 연결 (id = auth.users.id)
}

// 약관 동의 — 회원이 어떤 버전에 동의했는지 영구 보존 (분쟁 증빙)
model UserAgreement {
  id                    String   @id @default(uuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  agreementVersionId    String
  agreementVersion      AgreementVersion @relation(fields: [agreementVersionId], references: [id])
  agreedAt              DateTime @default(now())
  ipAddress             String
  @@index([userId])
}

// 약관 항목 (= 슬롯). 어드민이 자유롭게 추가/비활성 가능
// 기본 시드: terms, privacy, marketing
model AgreementTemplate {
  id           String   @id @default(uuid())
  slug         String   @unique          // "terms", "privacy", "marketing", "location" 등 자유
  title        String                    // "이용약관", "개인정보 처리방침"
  required     Boolean                   // 필수 동의 여부
  displayOrder Int      @default(0)      // 회원가입 화면 노출 순서
  active       Boolean  @default(true)   // 비활성 시 신규 가입에서 제외
  versions     AgreementVersion[]
  createdAt    DateTime @default(now())
}

// 약관 본문 (버전별). 어드민이 Tiptap으로 작성. 새 버전은 새 row
model AgreementVersion {
  id           String   @id @default(uuid())
  templateId   String
  template     AgreementTemplate @relation(fields: [templateId], references: [id])
  version      String                    // "1.0", "1.1", "2.0"
  content      String   @db.Text         // Tiptap HTML 또는 JSON
  effectiveAt  DateTime                  // 적용 시작일
  createdBy    String                    // 작성한 어드민 ID
  createdAt    DateTime @default(now())
  agreements   UserAgreement[]
  @@unique([templateId, version])
  @@index([templateId, effectiveAt])
}

// ============ 관리자 ============
model AdminUser {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  role         AdminRole // SUPER | MEMBER
  permissions  Json     // 메뉴별 접근 권한 { "notice": true, "score": false, ... }
  invitedBy    String?
  status       AdminStatus // PENDING | ACTIVE | DISABLED
  createdAt    DateTime @default(now())
  // Supabase Auth와 별도 또는 통합 — 결정 필요
}

// ============ 종목 (다종목 확장 대비) ============
model Sport {
  id           String   @id @default(uuid())
  code         String   @unique  // "GOLF", "RHYTHMIC", "BASKETBALL"
  name         String            // "골프"
  active       Boolean  @default(true)
  tournaments  Tournament[]
  players      Player[]
}

// ============ 공지 ============
model Notice {
  id           String   @id @default(uuid())
  sportId      String?
  sport        Sport?   @relation(fields: [sportId], references: [id])
  title        String
  content      String   @db.Text   // 마크다운 또는 리치 텍스트
  category     String?              // "공지", "결과", "일정"
  thumbnailUrl String?              // R2 URL
  attachments  NoticeAttachment[]
  authorId     String               // AdminUser
  publishedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([sportId, publishedAt])
}

model NoticeAttachment {
  id           String   @id @default(uuid())
  noticeId     String
  notice       Notice   @relation(fields: [noticeId], references: [id], onDelete: Cascade)
  fileName     String
  fileSize     Int
  mimeType     String
  r2Key        String   // R2 객체 경로
  isPublic     Boolean  // 공개 버킷 / 비공개 버킷
}

// ============ 선수 ============
// 정책: 모든 선수는 회원이어야 함 (userId 필수)
// 탈퇴 후 익명화 시: userId = null, name = "선수_XXXX" 으로 마스킹
model Player {
  id           String   @id @default(uuid())
  sportId      String
  sport        Sport    @relation(fields: [sportId], references: [id])
  userId       String?  // 활동 중에는 필수, 탈퇴 익명화 시 null
  user         User?    @relation(fields: [userId], references: [id])
  name         String   // 선수명 (User.name과 다를 수 있음 — 영문명 등)
  birthYear    Int?
  affiliation  String?
  photoUrl     String?
  anonymized   Boolean  @default(false)  // 탈퇴 후 익명화 여부
  scores       Score[]
  @@unique([sportId, userId])  // 한 사람이 한 종목에 1개의 선수 프로필
  @@index([sportId, name])
}

// ============ 대회 ============
model Tournament {
  id           String   @id @default(uuid())
  sportId      String
  sport        Sport    @relation(fields: [sportId], references: [id])
  name         String
  startDate    DateTime
  endDate      DateTime
  venue        String?
  rounds       Int      @default(1)
  scores       Score[]
  @@index([sportId, startDate])
}

// ============ 스코어 ============
model Score {
  id           String   @id @default(uuid())
  tournamentId String
  tournament   Tournament @relation(fields: [tournamentId], references: [id])
  playerId     String
  player       Player   @relation(fields: [playerId], references: [id])
  round        Int
  scoreData    Json     // 종목별 다른 형식. 골프: { "front9": 38, "back9": 40, "total": 78, "par": 72, "hbh": [...] }
  rank         Int?
  notes        String?
  createdAt    DateTime @default(now())
  @@unique([tournamentId, playerId, round])
  @@index([playerId])
}

enum UserStatus     { ACTIVE DORMANT WITHDRAWN_PENDING WITHDRAWN_DELETED }
enum UserType       { GENERAL PLAYER }
enum Gender         { MALE FEMALE }
enum AdminRole      { SUPER MEMBER }
enum AdminStatus    { PENDING ACTIVE DISABLED }
```

### 5.1 주요 설계 결정
- **`scoreData JSONB`**: 종목별 스코어 형식이 달라 폴리모픽 처리. 골프 스코어카드 ↔ 리듬체조 점수 ↔ 농구 박스스코어
- **Player와 User 분리 유지**: 모든 선수가 회원가입(필수)이지만 테이블은 분리. 이유: (1) 한 회원이 여러 종목 선수일 수 있음, (2) 탈퇴 후 익명화된 기록 보존을 위해 별도 모델 필요
- **탈퇴 시 데이터 처리**: User의 개인정보는 30일 후 삭제, Player는 `userId = null`로 익명화 후 보존
- **Sport 테이블**: 1차에는 `GOLF` 1개 row만. 확장 시 row 추가만으로 시작 가능

---

## 6. 권한 모델 (RBAC)

### 6.1 역할
| 역할 | 범위 |
|---|---|
| **공개 (비로그인)** | 메인홈, 공지 목록·상세, **대회 결과 목록·상세 (순위·이름·총타수까지만)** |
| **로그인 사용자** | + 마이페이지, **본인의 스코어카드·승률·참가 대회 상세** |
| **어드민 멤버** | + 부여받은 메뉴, **모든 선수의 스코어카드·기록 조회** |
| **슈퍼어드민** | + 전체 메뉴, 관리자 초대·권한 부여 |

> **핵심 제약**: 일반 로그인 사용자도 **다른 선수의 상세 스코어카드는 볼 수 없음**. 대회 결과 페이지에서 순위·이름·총타수까지만 노출.

### 6.2 메뉴별 권한 매트릭스 (`AdminUser.permissions` JSON 구조)
```json
{
  "notices": { "read": true, "write": true },
  "members": { "read": true, "write": false },
  "scores":  { "read": true, "write": true },
  "tournaments": { "read": true, "write": false },
  "admins":  { "read": false, "write": false }
}
```
슈퍼어드민은 이 값과 무관하게 모두 허용.

### 6.3 첫 슈퍼어드민 지정
- 환경변수 `INITIAL_SUPER_ADMIN_EMAIL`로 지정
- 첫 배포 시 마이그레이션 스크립트가 해당 이메일을 슈퍼어드민으로 등록
- 슈퍼어드민은 이후 다른 슈퍼어드민도 추가 가능

### 6.4 관리자 초대 흐름
1. 슈퍼어드민이 `/admin/admins`에서 이메일·역할·권한 입력
2. 초대 토큰 생성 → 이메일 발송 (Resend)
3. 초대 링크 클릭 → 비밀번호 설정 → `AdminStatus = ACTIVE`

---

## 7. 파일 업로드 정책

| 자산 | 저장소 | 업로드 방식 | 접근 |
|---|---|---|---|
| 공지 이미지 (jpg/png/webp) | R2 공개 버킷 | Presigned PUT | 공개 URL + next/image |
| 공지 첨부 (pdf/docx) | R2 비공개 버킷 | Presigned PUT | Presigned GET (5분 만료) |
| 짧은 영상 (mp4, ≤100MB) | R2 공개 버킷 | Presigned PUT (Multipart) | 공개 URL + `<video>` |
| 긴 영상 | YouTube | 외부 업로드 | URL 임베드 |
| 선수 프로필 사진 | R2 공개 버킷 | Presigned PUT | 공개 URL |

### 7.1 업로드 제약
- 이미지: 최대 10MB, jpg/png/webp/avif
- PDF: 최대 50MB
- 영상: 최대 100MB (그 이상은 YouTube)
- 서버에서 Presigned URL 발급 시 `Content-Type`·`Content-Length` 검증

---

## 8. 인프라 & 배포

### 8.1 배포 환경
| 환경 | 트리거 | URL |
|---|---|---|
| Production | `main` 머지 | 도메인주소.com |
| Preview | PR 생성 | 임시.vercel.app |
| Local | 개발자 로컬 | localhost:3000 |

### 8.2 도메인
- 보유 도메인 → Vercel DNS 연결
- `/admin`은 같은 도메인 하위 라우트 (Next.js 미들웨어로 권한 체크)

### 8.3 CI/CD (GitHub Actions)
PR마다 자동 실행:
- TypeScript 타입체크
- ESLint
- (있을 때) 단위 테스트

`main` 브랜치 push 시 → Vercel 자동 프로덕션 배포

### 8.4 데이터베이스 마이그레이션
- Prisma Migrate 또는 Supabase Migration
- PR 머지 후 Vercel 빌드 단계에서 자동 적용 (또는 수동 실행)
- 프로덕션은 항상 백업 후 적용

### 8.5 모니터링
- **Vercel Analytics**: 페이지뷰·성능
- **Sentry**: 에러 추적 (무료 티어 5K 이벤트/월)
- **Supabase Dashboard**: DB 사용량·쿼리 성능
- **Cloudflare R2 Dashboard**: 스토리지 사용량

### 8.6 백업
- Supabase: 일일 자동 백업 (Pro 플랜 시 7일 보관)
- R2: 중요 첨부파일은 별도 버킷에 주기적 복제 (선택)

---

## 9. 단계별 출시 계획 (제안)

| 단계 | 기간 | 산출물 |
|---|---|---|
| **M0. 환경 준비** | 0.5주 | GitHub repo, Vercel·Supabase·R2 계정, 도메인 연결, 헬로월드 배포 |
| **M1. 인증·약관** | 1주 | 회원가입/로그인/약관동의/비밀번호 재설정 |
| **M2. 공지 시스템** | 1주 | 공지 CRUD (어드민) + 공개 목록·상세 (유저), R2 업로드 |
| **M3. 어드민 RBAC** | 0.5주 | 슈퍼어드민·멤버·메뉴별 권한, 관리자 초대 |
| **M4. 선수·대회·스코어** | 1.5주 | 데이터 모델, 어드민 입력 UI, 공개 조회 화면 |
| **M5. 회원 관리** | 0.5주 | 회원 목록·상세·휴면·탈퇴 처리 |
| **M6. UI 다듬기·QA** | 1주 | 반응형, 접근성, 크로스 브라우저, 부하 테스트 |
| **M7. 베타 출시** | 0.5주 | 비공개 베타 → 피드백 → 공개 |
| **합계 (MVP)** | **~6주** | |

### 9.1 Phase 2 (다종목 확장 시점)
- `Sport` 테이블에 row 추가
- 종목별 `scoreData` 스키마 정의 (TypeScript 타입)
- 종목별 어드민 스코어 입력 폼
- 종목별 공개 조회 UI

---

## 10. 비용 예상 (월간)

### 10.1 시작 시 (Hobby 단계)
| 항목 | 비용 |
|---|---|
| Vercel Hobby | $0 |
| Supabase Free | $0 (DB 0.5GB, MAU 50K) |
| Cloudflare R2 | $0 (10GB 무료) |
| 도메인 | (이미 보유) |
| Resend (메일) | $0 (3K/월 무료) |
| Sentry | $0 (5K 이벤트) |
| **합계** | **$0/월** |

### 10.2 Pro 전환 후 (트래픽 증가 시점)
| 항목 | 비용 |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro (백업·성능) | $25 |
| Cloudflare R2 (~30GB) | $0.5 |
| Resend | $0 |
| Sentry | $0 |
| **합계** | **~$45/월** |

### 10.3 Vercel Hobby → Pro 전환 시점 (트리거)
다음 중 **하나라도 도달하면 Pro 업그레이드** 검토:
- 월 대역폭 **80GB 도달** (Hobby 한도 100GB의 80%)
- 월 함수 호출 **80K 도달** (Hobby 한도 100K의 80%)
- 월 이미지 최적화 **800회 도달** (Hobby 한도 1K의 80%)
- 사이트가 학교/기관 **공식 운영**으로 전환되는 시점 (Hobby는 비상업적 용도 권장)
- 팀 협업이 필요해질 때 (Hobby는 단일 사용자)

**전환 절차**: Vercel 대시보드 > Settings > Plan > Upgrade to Pro. 코드·환경변수·도메인 그대로 유지.

### 10.4 Hobby 단계 주의사항
- **상업적 이용 회색지대**: Vercel 약관상 Hobby는 비상업적·개인 프로젝트 권장. 학교 골프대회 공식 사이트는 애매함 → **공식 운영 선언 시점에 Pro로 전환**
- **DDoS·트래픽 폭증 시 일시 중단** 가능 (Hobby는 자동 보호 약함). Pro는 보호 강화
- **팀 멤버 추가 불가**: 외주 개발자와 협업하려면 임시로 Vercel 계정 공유 또는 GitHub 연동만

### 10.5 비용 폭증 위험
- **이미지·영상 트래픽 폭증**: R2는 egress 무료라 위험 없음
- **DB 저장량**: 텍스트 데이터라 수년 누적해도 무료 한도 내
- **Vercel 함수 실행**: 500 DAU 기준 Hobby 한도 안에서도 가능. 트래픽 10배 시 Pro 필수

---

## 11. 보안 고려사항

| 영역 | 대응 |
|---|---|
| **비밀번호** | Supabase Auth 표준 (bcrypt) |
| **세션** | HttpOnly·Secure 쿠키 |
| **CSRF** | Next.js Server Actions 내장 보호 |
| **XSS** | 공지 본문은 sanitize-html, 마크다운 렌더 시 escape |
| **SQL Injection** | Prisma 파라미터 바인딩 |
| **권한 우회** | 모든 어드민 API에 미들웨어로 role 체크, RLS(Row Level Security) 검토 |
| **파일 업로드** | Presigned URL에 Content-Type·Size 강제, MIME 검증 |
| **개인정보** | 약관 동의 이력 보관, 탈퇴 시 마스킹 (법정 보관기간 후 완전 삭제) |
| **환경변수** | Vercel + Supabase Vault, 코드에 하드코딩 금지 |
| **HTTPS** | Vercel 자동 발급·갱신 |
| **Rate Limiting** | Vercel Edge Middleware 또는 Upstash Redis (로그인 시도 등) |

---

## 12. 비기능 요구사항

| 항목 | 목표 |
|---|---|
| 페이지 로딩 (LCP) | < 2.5초 |
| API 응답 (p95) | < 500ms |
| 가용성 | 99.5% (월 다운타임 ~3시간 허용) |
| 모바일 대응 | iPhone SE (375px) 이상 |
| 브라우저 | Chrome/Safari/Edge 최신 2버전, 모바일 Chrome/Safari |
| 접근성 | WCAG AA 핵심 (대비, 키보드, 스크린리더 라벨) |
| SEO | 공지 페이지 indexable, OpenGraph 메타 |
| 한국어 처리 | UTF-8, 검색은 PG `pg_trgm` 또는 ILIKE |

---

## 13. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| Vercel 락인·비용 증가 | 월 비용 ↑ | 월 사용량 모니터링, Hobby 한도 80% 도달 시 Pro 전환, 5만 DAU 도달 시 Cloudflare Pages 이전 검토 |
| Hobby 한도 초과로 사이트 일시 중단 | 가용성 ↓ | Vercel 대시보드에서 사용량 알림 설정, 한도 70% 시 사전 Pro 전환 |
| Supabase 장애 | 사이트 전체 다운 | 일일 백업, 장애 대비 DB 덤프 보관 |
| 대회 직후 트래픽 spike | 응답 지연 | 공지·스코어는 ISR 캐싱, 인덱스 튜닝 |
| 회원 탈퇴/개인정보 분쟁 | 법적 리스크 | 약관 버전·동의 이력 영구 보관, 탈퇴 시 마스킹·30일 후 삭제 |
| 어드민 계정 탈취 | 데이터 유출 | 2FA 적용 검토, 관리자 활동 로그 |
| 파일 업로드 악용 | 스토리지 비용 ↑ | 어드민만 업로드, 사용자 업로드는 회원 프로필 정도로 제한 |
| 다종목 확장 시 스키마 부담 | 개발 비용 ↑ | `scoreData JSONB`로 종목별 형식 분리, 공통은 정규화 |

---

## 14. 결정사항 & 백로그

### 14.1 확정된 정책 (v0.2 결정)

| 항목 | 결정 |
|---|---|
| Player와 User | **모든 선수 회원가입 필수**, User 1 : Player N (종목별) |
| 본인 외 스코어 조회 | **불가** (어드민만 가능) |
| 대회 결과 공개 범위 | 순위·이름·총타수까지 공개, 상세 스코어카드는 본인만 |
| 휴면 | **1년 미접속 시 자동 휴면**, 30일 전 안내 |
| 탈퇴 | **30일 유예 후 개인정보 삭제**, 스코어는 익명화 보존 |
| 약관 변경 처리 | 정보통신망법 §15 기준 (일반 7일 / 불리 30일 + 재동의) |
| 공지 에디터 | **Tiptap (WYSIWYG)** |
| 스코어 입력 | **수기 + 엑셀 업로드 병행** |
| 메일 발송 | Resend, `noreply@<도메인>` SPF/DKIM 설정 |
| 결제 시스템 | **도입하지 않음** |
| 약관 관리 방식 | **어드민이 직접 본문 작성·버전 발행 (Tiptap)**. 약관 종류 자유 추가 가능 |
| 호스팅 | Vercel Hobby (시작) → Pro 전환 |

### 14.2 Phase 2 백로그 (MVP 이후)

| 항목 | 비고 |
|---|---|
| 약관 변경 시 자동 이메일 + 사이트 배너 공지 | 1차에는 어드민이 수동 안내 |
| 약관 변경 시 재동의 모달 자동 노출 | 1차에는 약관 페이지 갱신 + 안내만 |
| 휴면 안내 메일 자동 발송 | 1차에는 어드민 수동 발송 가능 (혹은 cron job 검토) |
| 다종목 확장 (리듬체조, 농구 등) | 종목별 스코어 입력 폼·엑셀 템플릿 추가 |
| 카카오/구글 소셜 로그인 | Supabase Auth 설정만 |
| 2단계 인증 (어드민) | 보안 강화 |
| 어드민 활동 로그 | 누가 언제 어떤 데이터를 변경했는지 추적 |
| 통계 대시보드 (어드민) | 가입 추이·대회 참여율 등 |
| 모바일 앱 | 반응형 웹으로 충분, 실제 수요 검증 후 |

### 14.3 추가 확정 필요 (실행 전)

| 항목 | 비고 |
|---|---|
| 첫 슈퍼어드민 이메일 | 환경변수 `INITIAL_SUPER_ADMIN_EMAIL` |
| 도메인 (구매 완료, 미공개) | DNS 설정 시 필요 |
| 이용약관·개인정보 처리방침 최종 문구 | 보유 중 → **어드민 화면에서 직접 입력** (시드 데이터로 자동 입력은 X, 첫 어드민이 작성) |
| 법적 책임자/사업자 정보 | 약관 하단 표기용 (수급 후 반영) |
| 학교 로고·브랜드 컬러 | 디자인 시안 단계 |

---

## 15. 다음 단계

1. ☐ v0.2 PRD 리뷰 및 승인
2. ☐ 와이어프레임/디자인 시안 (특히 마이페이지·대회 결과 페이지)
3. ☐ GitHub repo 생성 + Vercel(Hobby)·Supabase·R2·Resend 계정 셋업
4. ☐ 첫 슈퍼어드민 이메일 확정
5. ☐ 도메인 DNS 연결 (Vercel)
6. ☐ Resend 도메인 인증 (SPF/DKIM/DMARC TXT 레코드)
7. ☐ 약관·개인정보 처리방침 최종 문구 확정
8. ☐ M0 환경 준비 착수
