import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface E2eSupabaseEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export function loadE2eSupabaseEnv(): E2eSupabaseEnv {
  const fileEnv = readEnvFiles();
  const cliEnv = readSupabaseStatusEnv();
  const SUPABASE_URL =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    fileEnv.SUPABASE_URL ??
    fileEnv.VITE_SUPABASE_URL ??
    cliEnv.SUPABASE_URL ??
    cliEnv.API_URL;
  const SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    fileEnv.SUPABASE_ANON_KEY ??
    fileEnv.VITE_SUPABASE_ANON_KEY ??
    cliEnv.SUPABASE_ANON_KEY ??
    cliEnv.ANON_KEY;
  const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    fileEnv.SUPABASE_SERVICE_ROLE_KEY ??
    cliEnv.SUPABASE_SERVICE_ROLE_KEY ??
    cliEnv.SERVICE_ROLE_KEY;

  const missing = Object.entries({ SUPABASE_URL, SUPABASE_ANON_KEY })
    .filter(([, value]) => value === undefined || value.length === 0)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase E2E environment: ${missing.join(", ")}. Set the variables or add them to .env.local.`,
    );
  }

  return { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY };
}

export function requireE2eServiceRoleKey(env: E2eSupabaseEnv): string {
  if (env.SUPABASE_SERVICE_ROLE_KEY === undefined || env.SUPABASE_SERVICE_ROLE_KEY.length === 0) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. E2E global setup needs it to create the test user on the shared Supabase server.",
    );
  }
  return env.SUPABASE_SERVICE_ROLE_KEY;
}

function readEnvFiles(): Record<string, string> {
  return [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../..", ".env.local"),
    resolve(process.cwd(), "../..", ".env"),
  ].reduce<Record<string, string>>((env, path) => {
    if (!existsSync(path)) return env;
    return { ...env, ...parseEnv(readFileSync(path, "utf8")) };
  }, {});
}

function readSupabaseStatusEnv(): Record<string, string> {
  try {
    return parseEnv(
      execFileSync("npx", ["supabase", "status", "-o", "env"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }),
    );
  } catch {
    return {};
  }
}

function parseEnv(output: string): Record<string, string> {
  return Object.fromEntries(
    output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        if (separator === -1) return null;
        const key = line.slice(0, separator);
        const value = line.slice(separator + 1).replace(/^['"]|['"]$/g, "");
        return [key, value] as const;
      })
      .filter((entry): entry is readonly [string, string] => entry !== null),
  );
}
