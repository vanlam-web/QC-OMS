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

Current dev/staging uses Supabase Cloud as the primary backend. Developer machines run the Vite frontend locally and connect to the cloud Supabase project and cloud Edge Function API.

The old shared-dev LAN/Tailscale server is retained only as an optional fallback or operator-run environment. It is not the default runtime path for new development.

## Developer machine setup

Required locally:

- Node.js 22
- npm
- Deno 2.x

Install dependencies:

```bash
npm ci
```

Frontend `.env.local` should contain only public frontend values:

```bash
VITE_SUPABASE_URL=https://yentlbgbtmumilbzttge.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase Cloud>
VITE_API_BASE_URL=https://yentlbgbtmumilbzttge.supabase.co/functions/v1
VITE_APP_ENV=cloud-dev
```

`VITE_API_BASE_URL` is the Edge Functions root. Do not append `/api`; the app client already calls paths such as `/api/v1/health`.

Do not put `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

Start the frontend:

```bash
npm run dev -- --host 127.0.0.1
```

## Cloud smoke

Cloud staging login:

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

Optional automated smoke:

```bash
export E2E_ADMIN_EMAIL="admin@qc.local"
# Set E2E_ADMIN_PASSWORD from the operator secret store before running.
npm run test:e2e
```

The automated smoke can skip E2E bootstrap when the cloud admin user already exists. If a test needs to create or reset users, run that bootstrap from a trusted operator shell, not from frontend `.env.local`.

## Server-side verification

Run database and Edge Function integration checks locally or from a trusted operator machine when a slice touches migrations or cloud runtime behavior:

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

Database tests and browser E2E against non-public/private fallback environments are operator gates, not default pull-request gates.

## Staging deploy order

1. Confirm developer verification is green.
2. Confirm server-side database and Edge Function verification is green when the slice touches those layers.
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

- Shared-dev LAN/Tailscale is an optional fallback, not the default dev/staging backend.
- The Phase 0 rate limiter is in memory and acceptable only for a single staging instance. Replace it with a distributed store before multi-instance production traffic.
