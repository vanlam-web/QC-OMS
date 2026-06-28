# Phase 0 Runbook

## Local verification

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

After Docker Desktop is healthy:

```bash
npm run supabase:start
npm run supabase:reset
npm run test:functions
```

Run E2E with externally supplied credentials:

```bash
export E2E_ADMIN_EMAIL="admin@example.test"
export E2E_ADMIN_PASSWORD="<not committed>"
npm run test:e2e
```

Never commit Auth passwords, refresh tokens, access tokens, anon/service keys, or `.env.local` files.

## Phase 0 staging limitation

The in-memory rate limiter is acceptable only for a single staging instance. Before multi-instance production traffic, replace it with a distributed store keyed by user and route group.

## Current local blocker

Docker Desktop was running locally, but Docker/Supabase local commands did not respond reliably. Restart Docker Desktop and rerun Supabase reset, pgTAP, function integration, and E2E checks before staging promotion.
