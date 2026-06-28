# Shared development server

QC-OMS can be developed from many machines while all machines use the same
internal Supabase/Postgres database.

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
API:      http://192.168.1.104:54321/functions/v1/api
```

Tailscale:

```text
App:      http://100.123.122.45:3000
Supabase: http://100.123.122.45:54321
API:      http://100.123.122.45:54321/functions/v1/api
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

By default the app points to the shared LAN server at `192.168.1.104`.
The shared development anon key is built into the client defaults because it is
the public Supabase local anon key, not the service role key.

If a developer is remote through Tailscale, create `.env.local`:

```env
VITE_SHARED_SERVER_HOST=100.123.122.45
VITE_SUPABASE_URL=http://100.123.122.45:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_API_BASE_URL=http://100.123.122.45:54321/functions/v1/api
VITE_APP_ENV=shared-dev
```

For LAN development, `.env.local` is only needed when overriding the default
server IP or setting the shared Supabase anon key locally.

Never commit `.env.local`, service role keys, passwords, access tokens, or
refresh tokens.
