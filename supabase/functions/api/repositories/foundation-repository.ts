import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.108.2";
import type {
  CurrentUserRecord,
  FoundationRepository,
  GetCurrentUserInput,
  PermissionCode,
  PermissionData,
  UserListItem,
  WorkstationData,
} from "../contracts.ts";

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
    async listWorkstations(organizationId: string): Promise<WorkstationData[]> {
      const { data, error } = await client
        .from("workstations")
        .select("id, code, name, status")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("code", { ascending: true });

      if (error !== null) {
        throw error;
      }

      return data ?? [];
    },
    async createWorkstation(input): Promise<WorkstationData> {
      const { data, error } = await client
        .from("workstations")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          status: "active",
        })
        .select("id, code, name, status")
        .single();

      if (error !== null) {
        throw error;
      }

      return data;
    },
    async updateWorkstation(input): Promise<WorkstationData | null> {
      const patch: { code?: string; name?: string; status?: "active" | "inactive" } = {};

      if (input.code !== undefined) {
        patch.code = input.code;
      }
      if (input.name !== undefined) {
        patch.name = input.name;
      }
      if (input.status !== undefined) {
        patch.status = input.status;
      }

      const { data, error } = await client
        .from("workstations")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, status")
        .maybeSingle();

      if (error !== null) {
        throw error;
      }

      return data;
    },
    async listUsers(input): Promise<{ items: UserListItem[]; total: number }> {
      let query = client
        .from("profiles")
        .select("user_id, display_name, status", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("display_name", { ascending: true })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (input.status !== undefined) query = query.eq("status", input.status);
      if (input.search !== undefined) query = query.ilike("display_name", `%${input.search}%`);

      const { data, error, count } = await query;
      if (error !== null) throw error;
      const items = await Promise.all((data ?? []).map((row) => hydrateUser(client, row, "")));
      return { items, total: count ?? 0 };
    },
    async getUser(input): Promise<UserListItem | null> {
      const { data, error } = await client
        .from("profiles")
        .select("user_id, display_name, status")
        .eq("organization_id", input.organizationId)
        .eq("user_id", input.userId)
        .maybeSingle();
      if (error !== null) throw error;
      return data === null ? null : await hydrateUser(client, data, "");
    },
    async createUser(input): Promise<UserListItem> {
      const { data: authUser, error: authError } = await client.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      });
      if (authError !== null) throw authError;
      const createdId = authUser.user.id;
      try {
        const { error } = await client.rpc("create_profile_with_permissions", {
          p_actor_user_id: input.actorUserId,
          p_user_id: createdId,
          p_display_name: input.displayName,
          p_permission_codes: input.permissions,
          p_trace_id: input.traceId,
        });
        if (error !== null) throw error;
      } catch (cause) {
        await client.auth.admin.deleteUser(createdId);
        throw cause;
      }
      return {
        id: createdId,
        email: input.email,
        display_name: input.displayName,
        status: "active",
        permissions: [...input.permissions].sort(),
      };
    },
    async updateUser(input): Promise<UserListItem | null> {
      const { error } = await client.rpc("update_profile_status", {
        p_actor_user_id: input.actorUserId,
        p_target_user_id: input.userId,
        p_display_name: input.displayName ?? null,
        p_status: input.status ?? null,
      });
      if (error !== null) throw error;
      return await this.getUser({ organizationId: input.organizationId, userId: input.userId });
    },
    async replaceUserPermissions(input): Promise<UserListItem | null> {
      const { error } = await client.rpc("replace_user_permissions", {
        p_actor_user_id: input.actorUserId,
        p_target_user_id: input.userId,
        p_permission_codes: input.permissions,
        p_trace_id: input.traceId,
      });
      if (error !== null) throw error;
      return await this.getUser({ organizationId: input.organizationId, userId: input.userId });
    },
    async listPermissions(): Promise<PermissionData[]> {
      const { data, error } = await client
        .from("permissions")
        .select("code, module, description")
        .eq("status", "active")
        .order("code", { ascending: true });
      if (error !== null) throw error;
      return (data ?? []) as PermissionData[];
    },
  };
}

async function hydrateUser(
  client: DatabaseClient,
  row: { user_id: string; display_name: string; status: "active" | "inactive" },
  email: string,
): Promise<UserListItem> {
  const { data: permissionRows, error } = await client
    .from("user_permissions")
    .select("permission_code")
    .eq("user_id", row.user_id)
    .order("permission_code", { ascending: true });
  if (error !== null) throw error;
  return {
    id: row.user_id,
    email,
    display_name: row.display_name,
    status: row.status,
    permissions: (permissionRows ?? []).map((permission) => permission.permission_code as PermissionCode),
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
