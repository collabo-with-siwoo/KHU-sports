---
description: Prisma 스키마 변경 후 마이그레이션을 생성하고 적용합니다
---

# /db-migrate — Prisma 마이그레이션

사용법: `/db-migrate` 또는 "마이그레이션 해줘"

> PRD §5의 데이터 모델 변경 시 사용합니다.

## 워크플로우

// turbo
1. Prisma 스키마를 검증한다:
   ```bash
   npx prisma validate
   ```

2. 마이그레이션을 생성한다:
   ```bash
   npx prisma migrate dev --name {description}
   ```
   - description 예시: `add-agreement-template`, `add-score-data`

3. Prisma Client를 재생성한다:
   ```bash
   npx prisma generate
   ```

4. 변경된 스키마를 `docs/specs.md`에 반영한다.

5. 커밋한다:
   ```bash
   git add -A && git commit -m "chore(db): migrate — {description}"
   ```

## 시드 데이터 (PRD §4.2.2)

초기 약관 템플릿 시드:
```bash
npx prisma db seed
```

> 기본 시드: terms (이용약관, 필수), privacy (개인정보 처리방침, 필수), marketing (마케팅 수신, 선택)

## ⚠️ 주의사항

- 프로덕션 마이그레이션은 **반드시 백업 후 적용** (PRD §8.4)
- `scoreData`는 JSONB — 종목별 형식 변경 시 타입만 업데이트 (스키마 마이그레이션 불필요)
- Player 모델에서 `userId`는 nullable (탈퇴 익명화 대비)
