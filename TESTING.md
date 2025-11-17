# Testing in Readowl (Next.js)

This project includes automated tests at two levels:

- End-to-End (E2E): Playwright tests under `tests/e2e`.
- Unit: Vitest unit tests under `src/__tests__`.

Both suites can be run locally, produce coverage (for unit tests), and are safe to execute in CI.

## 1) Prerequisites

- Node.js 20+
- Dependencies installed (`npm install`)

For E2E tests, Playwright is configured to auto-start the Next.js dev server (webServer) on the first free port near 3000.

## 2) Run the app locally

- Dev: `npm run dev`
- Prod: `npm run build && npm start`

If the port 3000 is busy, Next.js may pick another port; set `PLAYWRIGHT_BASE_URL` accordingly.

## 3) Run tests

- Unit tests with coverage:

  npm run test

  Coverage reports are written to `coverage/` (HTML + text).

- E2E tests (Playwright):

  First-time only, install browsers:

  npx playwright install chromium

  Then run:

  npm run test:e2e

  The E2E runner uses `PLAYWRIGHT_BASE_URL` (default `http://localhost:3000`). It will start the dev server automatically. Reports are written to `playwright-report/`.

- Run everything:

  npm run test:all

## 4) What is covered

- Smoke navigation (landing/login redirect) to ensure the app renders and guards unauthenticated routes.
- Utility functions:
  - `slugify` ensures SEO-friendly slugs (accent folding, spaces to hyphens, lowercase).
  - `isLikelyBot` flags common crawler user-agents for view-count hygiene.

## 5) Adding more tests

- E2E: create new specs under `tests/e2e/*.spec.ts`. Use page locators with accessible labels and test user flows.
- Unit: add files like `src/__tests__/*.test.ts(x)` and import the functions/components you want to test. For React component tests, install and configure React Testing Library if needed.

## 6) CI tips

- Cache npm and Playwright browsers to speed up.
- Build once, start the server, and run tests in parallel jobs if desired.

## 7) Troubleshooting

- Type errors about Playwright or Vitest types: ensure dev dependencies are installed.
- E2E cannot reach the app: confirm server URL and set `PLAYWRIGHT_BASE_URL`. If port 3000 is busy, Next will pick an available one and Playwright will reuse it.
- Flaky E2E: enable `trace: 'on-first-retry'` in Playwright (already configured) and inspect traces.
