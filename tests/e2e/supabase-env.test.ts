import { describe, expect, test } from "vitest";
import { resolveE2eSupabaseEnv } from "./supabase-env";

describe("resolveE2eSupabaseEnv", () => {
  test("uses complete CLI env instead of mixing incomplete file env with local service role", () => {
    const env = resolveE2eSupabaseEnv({
      processEnv: {},
      fileEnv: {
        SUPABASE_URL: "https://cloud.supabase.co",
        SUPABASE_ANON_KEY: "cloud-anon",
      },
      cliEnv: {
        API_URL: "http://127.0.0.1:54321",
        ANON_KEY: "local-anon",
        SERVICE_ROLE_KEY: "local-service-role",
      },
    });

    expect(env).toEqual({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_ANON_KEY: "local-anon",
      SUPABASE_SERVICE_ROLE_KEY: "local-service-role",
    });
  });

  test("uses CLI env together when file env is incomplete", () => {
    const env = resolveE2eSupabaseEnv({
      processEnv: {},
      fileEnv: { SUPABASE_URL: "https://cloud.supabase.co" },
      cliEnv: {
        API_URL: "http://127.0.0.1:54321",
        ANON_KEY: "local-anon",
        SERVICE_ROLE_KEY: "local-service-role",
      },
    });

    expect(env).toEqual({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_ANON_KEY: "local-anon",
      SUPABASE_SERVICE_ROLE_KEY: "local-service-role",
    });
  });

  test("prefers complete CLI env over file env so local E2E stays consistent", () => {
    const env = resolveE2eSupabaseEnv({
      processEnv: {},
      fileEnv: {
        SUPABASE_URL: "https://cloud.supabase.co",
        SUPABASE_ANON_KEY: "cloud-anon",
        SUPABASE_SERVICE_ROLE_KEY: "cloud-service-role",
      },
      cliEnv: {
        API_URL: "http://127.0.0.1:54321",
        ANON_KEY: "local-anon",
        SERVICE_ROLE_KEY: "local-service-role",
      },
    });

    expect(env).toEqual({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_ANON_KEY: "local-anon",
      SUPABASE_SERVICE_ROLE_KEY: "local-service-role",
    });
  });

  test("lets explicit process env override file and CLI env", () => {
    const env = resolveE2eSupabaseEnv({
      processEnv: {
        VITE_SUPABASE_URL: "https://process.supabase.co",
        VITE_SUPABASE_ANON_KEY: "process-anon",
        SUPABASE_SERVICE_ROLE_KEY: "process-service-role",
      },
      fileEnv: {
        SUPABASE_URL: "https://cloud.supabase.co",
        SUPABASE_ANON_KEY: "cloud-anon",
      },
      cliEnv: {
        API_URL: "http://127.0.0.1:54321",
        ANON_KEY: "local-anon",
        SERVICE_ROLE_KEY: "local-service-role",
      },
    });

    expect(env).toEqual({
      SUPABASE_URL: "https://process.supabase.co",
      SUPABASE_ANON_KEY: "process-anon",
      SUPABASE_SERVICE_ROLE_KEY: "process-service-role",
    });
  });
});
