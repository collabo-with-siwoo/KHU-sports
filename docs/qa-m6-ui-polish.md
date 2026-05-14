# M6 UI QA 정리 로그

## 범위

M6-A는 M0-M5에서 구현된 핵심 사용자 흐름을 대상으로 모바일 375px과 데스크톱 1365px 화면을 점검한다. 이번 스캔은 공개 페이지, 로그인/회원가입, 보호된 마이페이지, 보호된 관리자 페이지의 기본 렌더링, 리다이렉트, 명확한 overflow, 접근 가능한 컨트롤 이름, 브라우저 콘솔 오류를 확인했다.

## 라우트 스캔

| Route | Viewport | 결과 | 발견 사항 | 조치 |
|---|---:|---|---|---|
| `/` | 375px / 1365px | 통과 | 큰 overflow와 이름 없는 컨트롤 없음 | 없음 |
| `/notices` | 375px | 통과 | 카테고리 필터 버튼 일부가 모바일 뷰포트 오른쪽으로 밀리던 문제를 수정함 | 모바일에서 카테고리 칩 줄바꿈 적용 |
| `/notices` | 1365px | 통과 | 큰 overflow와 이름 없는 컨트롤 없음 | 없음 |
| `/notices/2026-application-guide` | 375px / 1365px | 통과 | 큰 overflow와 이름 없는 컨트롤 없음 | 없음 |
| `/results` | 375px | 통과 | 결과 표가 뷰포트보다 넓게 감지되던 문제를 수정함 | 모바일 개요 표는 핵심 열 중심으로 표시 |
| `/results` | 1365px | 통과 | 큰 overflow와 이름 없는 컨트롤 없음 | 없음 |
| `/results/seed-2026` | 375px / 1365px | 통과 | 큰 overflow와 이름 없는 컨트롤 없음 | 없음 |
| `/login` | 375px / 1365px | 통과 | 로그인 폼 렌더링 정상 | 없음 |
| `/signup` | 375px / 1365px | 통과 | 회원가입 폼 렌더링 정상 | 없음 |
| `/mypage` | 375px / 1365px | 통과 | 비로그인 상태에서 안내/리다이렉트 흐름 정상 | 없음 |
| `/mypage/scores` | 375px / 1365px | 통과 | 비로그인 상태에서 `/login?next=/mypage/scores`로 이동 | 없음 |
| `/mypage/score-results` | 375px / 1365px | 통과 | 비로그인 상태에서 `/login?next=/mypage/score-results`로 이동 | 없음 |
| `/admin` | 375px / 1365px | 통과 | 관리자 로그인 화면 렌더링 정상 | 없음 |
| `/admin/notices` | 375px / 1365px | 통과 | 비관리자 상태에서 `/admin?next=/admin/notices`로 이동 | 없음 |
| `/admin/notices/new` | 375px / 1365px | 통과 | 비관리자 상태에서 `/admin?next=/admin/notices/new`로 이동 | 없음 |
| `/admin/members` | 375px / 1365px | 통과 | 비관리자 상태에서 `/admin?next=/admin/members`로 이동 | 없음 |
| `/admin/tournaments` | 375px / 1365px | 통과 | 비관리자 상태에서 `/admin?next=/admin/tournaments`로 이동 | 없음 |
| `/admin/scores` | 375px / 1365px | 통과 | 비관리자 상태에서 `/admin?next=/admin/scores`로 이동 | 없음 |

## 콘솔 로그

1차 스캔에서 기능을 막는 client-side exception은 재현되지 않았다. 이후 재스캔에서 Pretendard CDN stylesheet/font가 CSP에 막히던 오류를 확인했고, 실제 사용하는 CDN origin만 CSP에 추가했다. DB 연결이 느릴 때 seed fallback으로 내려가는 경고는 개발 환경에서만 보이며, 기능을 막지는 않는다.

## 이번 브랜치에서 수정할 항목

- 모바일 공지 목록의 카테고리 필터가 화면 폭 안에서 자연스럽게 줄바꿈되도록 정리했다.
- 모바일 결과 목록의 표는 개요 화면에서 순위, 선수명, 합계 중심으로 보여 뷰포트 밖으로 새지 않도록 정리했다.
- 공개 notice/result DB 조회 기본 timeout을 4.5초로 조정했다. 1.5초 설정은 일부 cold public read가 너무 빨리 seed fallback으로 내려가 모바일/데스크톱에서 공지 목록이 다르게 보이는 원인이 될 수 있었다.
- DB가 비어 있거나 일시적으로 접근 불가할 때도 `/notices` 첫 seed fallback이 기존 7회 예시가 아니라 제27회 경희대학교 총장배 전국 골프대회 참가 신청 안내를 보여주도록 정리했다.
- CSP에 Pretendard CDN의 stylesheet/font origin을 추가해 브라우저 콘솔 오류를 줄였다.

## 재스캔 결과

- `/notices` 모바일: `documentElement.scrollWidth`가 viewport 폭과 동일하고, 고정 요소를 제외한 overflow 요소 0개.
- `/results` 모바일: `documentElement.scrollWidth`가 viewport 폭과 동일하고, 고정 요소를 제외한 overflow 요소 0개.
- 로컬 개발 서버 warm 상태 응답: `/results` 약 1.9초, `/notices` 약 2.1초, `/` 약 2.1초. 첫 컴파일은 Next.js dev server 특성상 별도 시간이 걸린다.

## 후속 작업

- 로그인된 선수/관리자 계정으로 실제 입력, 저장, 업로드, 승인 흐름을 끝까지 검증하는 작업은 별도 QA 계정과 테스트 데이터가 준비된 뒤 진행한다.
- M6-B에서 Lighthouse 또는 Web Vitals 기반 성능 측정을 추가해 5초 이내 체감 로딩 목표를 수치로 추적한다.
