# Phase 0 Runbook

## Scope

Phase 0 verifies the account-based foundation flow:

1. Sign in by account.
2. Open `/dashboard`.
3. Enter the `Ban hang` POS module.
4. Open administration screens by account permissions.
5. Sign out.

POS is a sales module in QC-OMS. It is not a physical workstation selection step, and the frontend must not require or store a POS machine id.

## Architecture decision

Supabase and Docker run on the shared server, not on each developer laptop. Developer machines run the frontend and connect to the shared Supabase server through Tailscale.

This keeps database state, Edge Functions, Auth users, and migration verification centralized for multiple dev machines.

## Developer machine setup

Required locally:

- Node.js 22
- npm
- Deno 2.x
- Tailscale connected to the QC-OMS network

Install dependencies:

```bash
npm ci
```

Frontend `.env.local` should contain only public frontend values:

```bash
VITE_SUPABASE_URL=http://100.123.122.45:54321
VITE_SUPABASE_ANON_KEY=<anon key from server>
VITE_API_BASE_URL=http://100.123.122.45:54321/functions/v1
```

Do not put `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

Start the frontend:

```bash
npm run dev -- --host 127.0.0.1
```

## Shared-server smoke

Shared server login:

- Account: `admin`
- Email equivalent: `admin@qc.local`
- Password: supplied out of band

Manual smoke from a dev machine:

1. Open `http://127.0.0.1:5173/login`.
2. Sign in.
3. Confirm `/dashboard` opens.
4. Open `Ban hang`.
5. Confirm `/pos` remains available after refresh.
6. Open `Quan tri` only with an account that has admin permission.
7. Sign out and confirm the app returns to `/login`.

Optional automated smoke from a Tailscale-connected machine:

```bash
export E2E_ADMIN_EMAIL="admin@qc.local"
# Set E2E_ADMIN_PASSWORD from the operator secret store before running.
npm run test:e2e
```

The automated smoke can skip E2E bootstrap when the shared server admin user already exists. If a test needs to create or reset users, run that bootstrap on the server side or from a trusted operator shell, not from frontend `.env.local`.

## Server-side verification

Run database and Edge Function integration checks on the shared server, where Docker and Supabase are installed:

```bash
npm run supabase:reset
npm run test:db
npm run test:functions
```

Use server-side environment files or operator shell variables for service-role access. Do not distribute service-role keys to ordinary dev machines.

## Developer verification

Run these before pushing frontend or shared TypeScript changes:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:functions
git diff --check
```

`npm run test:functions` runs Deno unit tests locally. Integration checks inside that suite require `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`; without them, only the local unit portions run.

## Bootstrap owner account

Create the first owner/admin account through the server-side Supabase Admin API or a secured server script only. Grant at least these active permissions:

- `perm.access_admin_panel`
- `perm.create_order`
- `perm.manage_users`
- `perm.view_shift_report`

Do not commit passwords, refresh tokens, access tokens, anon keys, service-role keys, or `.env.local` files.

## CI gates

The default GitHub Actions workflow is intentionally independent of the private Tailscale server. It runs:

- `npm audit --audit-level=high`
- lint
- typecheck
- unit/component tests
- production build
- Edge Function unit tests
- committed-secret scan

Database tests and browser E2E against the shared Supabase server are server/operator gates, not default pull-request gates, until the project adds an approved CI-to-Tailscale connection.

## Staging deploy order

1. Confirm developer verification is green.
2. Confirm server-side database and Edge Function verification is green.
3. Push reviewed migrations to the authorized staging Supabase project.
4. Deploy Edge Function `api`.
5. Configure frontend environment variables for staging.
6. Deploy the frontend.
7. Run the staging smoke test with credentials from the secret store.
8. Record Git SHA, function version, frontend deployment URL, E2E result, and owner acceptance date.

Do not run `seed.sql` against production or staging unless the migration owner explicitly approves it.

## Rollback

If staging smoke fails after deploy:

1. Revert the frontend deployment to the previous known-good build.
2. Re-deploy the previous Edge Function bundle if the failure is API-side.
3. Do not roll back database migrations manually without a reviewed down/forward-fix plan.
4. Preserve failing Playwright traces, Edge logs, and request trace ids before retrying.

## Known limitations

- GitHub CI currently does not connect to the private Tailscale Supabase server.
- The Phase 0 rate limiter is in memory and acceptable only for a single staging instance. Replace it with a distributed store before multi-instance production traffic.
