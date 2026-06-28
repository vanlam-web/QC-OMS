import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CurrentUserRecord, FoundationRepository, GetCurrentUserInput } from "../contracts.ts";

type DatabaseClient = SupabaseClient;

export function createFoundationRepository(client: DatabaseClient): FoundationRepository {
  return {
    async getCurrentUser(input: GetCurrentUserInput): Promise<CurrentUserRecord | null> {
      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("user_id, display_name, organization_id, organizations(id, code, name)")
        .eq("user_id", input.userId)
        .eq("status", "active")
        .maybeSingle();

      if (profileError !== null) {
        throw profileError;
      }

      if (profile === null) {
        return null;
      }

      const organization = Array.isArray(profile.organizations)
        ? profile.organizations[0]
        : profile.organizations;

      const { data: permissionRows, error: permissionError } = await client
        .from("user_permissions")
        .select("permission_code, permissions!inner(status)")
        .eq("user_id", input.userId)
        .eq("permissions.status", "active")
        .order("permission_code", { ascending: true });

      if (permissionError !== null) {
        throw permissionError;
      }

      let workstation = null;
      let workstationInvalid = false;

      if (input.workstationId !== null) {
        const { data: workstationRow, error: workstationError } = await client
          .from("workstations")
          .select("id, code, name, organization_id")
          .eq("id", input.workstationId)
          .eq("status", "active")
          .maybeSingle();

        if (workstationError !== null) {
          throw workstationError;
        }

        if (workstationRow === null || workstationRow.organization_id !== profile.organization_id) {
          workstationInvalid = true;
        } else {
          workstation = {
            id: workstationRow.id,
            code: workstationRow.code,
            name: workstationRow.name,
          };
        }
      }

      return {
        user: {
          id: input.userId,
          email: input.email,
          displayName: profile.display_name,
        },
        organization: {
          id: organization.id,
          code: organization.code,
          name: organization.name,
        },
        workstation,
        permissions: (permissionRows ?? []).map((row) => row.permission_code),
        workstationInvalid,
      };
    },
  };
}

export function createSupabaseRepositoryFromEnv(): FoundationRepository {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (url === undefined || serviceRoleKey === undefined) {
    throw new Error("Supabase API environment variables are required.");
  }

  return createFoundationRepository(createClient(url, serviceRoleKey));
}
