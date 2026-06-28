import { createApp } from "./app.ts";

const version = Deno.env.get("DENO_DEPLOYMENT_ID") ??
  Deno.env.get("VERCEL_GIT_COMMIT_SHA") ??
  Deno.env.get("GIT_SHA") ??
  "local";

const allowedOrigins = (Deno.env.get("QC_OMS_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

Deno.serve(createApp({ version, allowedOrigins }));
