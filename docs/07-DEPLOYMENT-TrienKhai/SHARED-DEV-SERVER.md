# Shared development server fallback

QC-OMS currently uses Supabase Cloud as the default dev/staging backend. This
document is kept for the optional shared-dev LAN/Tailscale fallback where many
machines use the same internal Supabase/Postgres database.

## Model

```text
Server Windows
- Runs Docker Desktop
- Runs Supabase/Postgres
- Optionally runs the shared web app on port 3000

Developer machines
- Install Git and Node.js 22
- Clone this repository
- Run the frontend only
- Connect to Supabase/API on the server
```

Developer machines do not need Docker Desktop or Supabase CLI unless they want
their own isolated local database.

## Server addresses

LAN:

```text
App:      http://192.168.1.104:3000
Supabase: http://192.168.1.104:54321
API base: http://192.168.1.104:54321/functions/v1
```

Tailscale:

```text
App:      http://100.123.122.45:3000
Supabase: http://100.123.122.45:54321
API base: http://100.123.122.45:54321/functions/v1
```

## Server commands

Run Supabase/Postgres on the server:

```powershell
cd "Y:\QC-OMS"
npm run supabase:start
npm run supabase:reset
```

Run the web app for other machines:

```powershell
cd "Y:\QC-OMS"
npm run dev:server
```

Open Windows Firewall inbound ports on the server:

```powershell
New-NetFirewallRule -DisplayName "QC-OMS App 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "QC-OMS Supabase API 54321" -Direction Inbound -Protocol TCP -LocalPort 54321 -Action Allow
```

Do not expose Postgres port `54322` broadly. Keep it for server/admin/backup.

## Developer machine commands

```powershell
git clone https://github.com/vanlam-web/QC-OMS.git
cd QC-OMS
npm ci
npm run dev
```

By default the app points to Supabase Cloud. Use this shared server only when an
operator explicitly chooses the LAN/Tailscale fallback.

If a developer is remote through Tailscale and the fallback server is active,
create `.env.local`:

```env
VITE_SUPABASE_URL=http://100.123.122.45:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_API_BASE_URL=http://100.123.122.45:54321/functions/v1
VITE_APP_ENV=shared-dev
```

For LAN fallback, use the same shape with `192.168.1.104`. `VITE_API_BASE_URL`
must point to the Edge Functions root (`.../functions/v1`), not
`.../functions/v1/api`, because the app client appends `/api/v1/...`.

Never commit `.env.local`, service role keys, passwords, access tokens, or
refresh tokens.
