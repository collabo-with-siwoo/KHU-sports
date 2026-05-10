# KHU Sports Golf

경희대학교 골프대회 공식 홈페이지입니다. 현재는 M0 프로젝트 기반 구축 단계입니다.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Verification

```bash
npm run typecheck
npm run lint
npm run prisma:validate
```

## Current Milestone

- M0: Next.js App Router foundation, TypeScript strict mode, Prisma schema, environment template, and executable specs.
- M1 next: Supabase Auth, username login mapping, sign-up form, and agreement consent records.
