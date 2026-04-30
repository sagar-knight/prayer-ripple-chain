# PrayerForward E2E Tests

Full end-to-end tests using Playwright against a running preview or production URL.

## Run locally
```bash
# Start dev server in another terminal: bun run dev
bunx playwright test

# Run a single flow
bunx playwright test e2e/01-home.spec.ts

# Open last HTML report
bunx playwright show-report
```

## Run against preview / production
```bash
E2E_BASE_URL=https://prayer-ripple-chain.lovable.app bunx playwright test
```

## Test accounts
Use the seeded test accounts (see Admin → Unit Testing). They are flagged
`is_test_account = true` and excluded from analytics.

## Coverage
| File | Flow |
|------|------|
| 01-home.spec.ts            | Public home renders, no console errors |
| 02-auth.spec.ts            | Signup form validation + login round-trip |
| 03-prayer-submit.spec.ts   | Submit a prayer (auth) |
| 04-pray-action.spec.ts     | Pray for someone, count increments |
| 05-translate.spec.ts       | Translate button shows non-English text |
| 06-admin-moderation.spec.ts| Admin queue loads, approve action visible |
| 07-church-join.spec.ts     | /join/:slug landing renders |
| 08-ripple-impact.spec.ts   | Ripple Impact page renders without errors |
