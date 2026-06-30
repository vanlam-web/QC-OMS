import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.108.2";
import type {
  CustomerData,
  CustomerGroupData,
  CurrentUserRecord,
  FoundationRepository,
  GetCurrentUserInput,
  PermissionCode,
  PermissionData,
  PriceListData,
  ProductData,
  ResolvedPriceData,
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
    async listProducts(input): Promise<{ items: ProductData[]; total: number }> {
      let query = client
        .from("products")
        .select("id, code, name, status, unit_name, sell_method", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("code", { ascending: true })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (input.status !== "all") query = query.eq("status", input.status);
      if (input.search !== undefined) {
        const search = input.search.replaceAll(",", " ").replaceAll("%", "\\%");
        query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error !== null) throw error;
      return { items: (data ?? []) as ProductData[], total: count ?? 0 };
    },
    async createProduct(input): Promise<ProductData> {
      const { data, error } = await client
        .from("products")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          status: input.status,
          unit_name: input.unitName,
          sell_method: input.sellMethod,
        })
        .select("id, code, name, status, unit_name, sell_method")
        .single();
      if (error !== null) throw error;
      return data as ProductData;
    },
    async updateProduct(input): Promise<ProductData | null> {
      const patch: {
        code?: string;
        name?: string;
        status?: "active" | "inactive";
        unit_name?: string;
        sell_method?: string;
      } = {};
      if (input.code !== undefined) patch.code = input.code;
      if (input.name !== undefined) patch.name = input.name;
      if (input.status !== undefined) patch.status = input.status;
      if (input.unitName !== undefined) patch.unit_name = input.unitName;
      if (input.sellMethod !== undefined) patch.sell_method = input.sellMethod;

      const { data, error } = await client
        .from("products")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, status, unit_name, sell_method")
        .maybeSingle();
      if (error !== null) throw error;
      return data as ProductData | null;
    },
    async listPriceLists(input): Promise<PriceListData[]> {
      let query = client
        .from("price_lists")
        .select("id, code, name, is_default, is_active")
        .eq("organization_id", input.organizationId)
        .order("is_default", { ascending: false })
        .order("code", { ascending: true });

      if (input.activeOnly) query = query.eq("is_active", true);

      const { data, error } = await query;
      if (error !== null) throw error;
      return (data ?? []) as PriceListData[];
    },
    async createPriceList(input): Promise<PriceListData> {
      const { data, error } = await client
        .from("price_lists")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          is_default: input.isDefault,
          is_active: true,
        })
        .select("id, code, name, is_default, is_active")
        .single();
      if (error !== null) throw error;
      return data as PriceListData;
    },
    async updatePriceList(input): Promise<PriceListData | null> {
      const patch: { code?: string; name?: string; is_default?: boolean; is_active?: boolean } = {};
      if (input.code !== undefined) patch.code = input.code;
      if (input.name !== undefined) patch.name = input.name;
      if (input.isDefault !== undefined) patch.is_default = input.isDefault;
      if (input.isActive !== undefined) patch.is_active = input.isActive;

      const { data, error } = await client
        .from("price_lists")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, is_default, is_active")
        .maybeSingle();
      if (error !== null) throw error;
      return data as PriceListData | null;
    },
    async upsertPriceListItem(input) {
      const { data, error } = await client
        .from("price_list_items")
        .upsert(
          {
            organization_id: input.organizationId,
            price_list_id: input.priceListId,
            product_id: input.productId,
            unit_price: input.unitPrice,
          },
          { onConflict: "price_list_id,product_id" },
        )
        .select("product_id, unit_price, price_list_id")
        .single();
      if (error !== null) throw error;
      return {
        product_id: data.product_id,
        unit_price: Number(data.unit_price),
        price_source: "default_price_list",
        price_list_id: data.price_list_id,
      };
    },
    async deletePriceListItem(input): Promise<boolean> {
      const { data, error } = await client
        .from("price_list_items")
        .delete()
        .eq("organization_id", input.organizationId)
        .eq("price_list_id", input.priceListId)
        .eq("product_id", input.productId)
        .select("id");
      if (error !== null) throw error;
      return (data ?? []).length > 0;
    },
    async listCustomers(input): Promise<{ items: CustomerData[]; total: number }> {
      let query = client
        .from("customers")
        .select("id, code, name, phone, customer_group_id, customer_groups(id, code, name)", { count: "exact" })
        .eq("organization_id", input.organizationId)
        .order("code", { ascending: true })
        .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

      if (input.search !== undefined) {
        const search = input.search.replaceAll(",", " ").replaceAll("%", "\\%");
        query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error !== null) throw error;
      return { items: (data ?? []).map(toCustomerData), total: count ?? 0 };
    },
    async createCustomer(input): Promise<CustomerData> {
      const code = input.code ?? await nextCustomerCode(client, input.organizationId);
      const { data, error } = await client
        .from("customers")
        .insert({
          organization_id: input.organizationId,
          code,
          name: input.name,
          phone: input.phone ?? null,
          customer_group_id: input.customerGroupId ?? null,
        })
        .select("id, code, name, phone, customer_group_id, customer_groups(id, code, name)")
        .single();
      if (error !== null) throw error;
      return toCustomerData(data);
    },
    async updateCustomer(input): Promise<CustomerData | null> {
      const patch: { code?: string; name?: string; phone?: string | null; customer_group_id?: string | null } = {};
      if (input.code !== undefined) patch.code = input.code;
      if (input.name !== undefined) patch.name = input.name;
      if (input.phone !== undefined) patch.phone = input.phone;
      if (input.customerGroupId !== undefined) patch.customer_group_id = input.customerGroupId;

      const { data, error } = await client
        .from("customers")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, phone, customer_group_id, customer_groups(id, code, name)")
        .maybeSingle();
      if (error !== null) throw error;
      return data === null ? null : toCustomerData(data);
    },
    async listCustomerGroups(input): Promise<CustomerGroupData[]> {
      let query = client
        .from("customer_groups")
        .select("id, code, name, price_list_id, is_active")
        .eq("organization_id", input.organizationId)
        .order("code", { ascending: true });

      if (input.activeOnly) query = query.eq("is_active", true);

      const { data, error } = await query;
      if (error !== null) throw error;
      return (data ?? []) as CustomerGroupData[];
    },
    async createCustomerGroup(input): Promise<CustomerGroupData> {
      const { data, error } = await client
        .from("customer_groups")
        .insert({
          organization_id: input.organizationId,
          code: input.code,
          name: input.name,
          price_list_id: input.priceListId,
          is_active: true,
        })
        .select("id, code, name, price_list_id, is_active")
        .single();
      if (error !== null) throw error;
      return data as CustomerGroupData;
    },
    async updateCustomerGroup(input): Promise<CustomerGroupData | null> {
      const patch: { code?: string; name?: string; price_list_id?: string; is_active?: boolean } = {};
      if (input.code !== undefined) patch.code = input.code;
      if (input.name !== undefined) patch.name = input.name;
      if (input.priceListId !== undefined) patch.price_list_id = input.priceListId;
      if (input.isActive !== undefined) patch.is_active = input.isActive;

      const { data, error } = await client
        .from("customer_groups")
        .update(patch)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("id, code, name, price_list_id, is_active")
        .maybeSingle();
      if (error !== null) throw error;
      return data as CustomerGroupData | null;
    },
    async resolvePrices(input) {
      const { data: defaultPriceList, error: defaultPriceListError } = await client
        .from("price_lists")
        .select("id")
        .eq("organization_id", input.organizationId)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();
      if (defaultPriceListError !== null) throw defaultPriceListError;
      if (defaultPriceList === null) throw new Error("DEFAULT_PRICE_LIST_REQUIRED");

      const productIds = [...new Set(input.productIds)];
      const { data: products, error: productsError } = await client
        .from("products")
        .select("id")
        .eq("organization_id", input.organizationId)
        .eq("status", "active")
        .in("id", productIds);
      if (productsError !== null) throw productsError;

      const activeProductIds = new Set((products ?? []).map((product) => product.id));
      if (activeProductIds.size !== productIds.length) throw new Error("PRODUCT_NOT_FOUND");

      let customerPriceListId: string | null = null;
      if (input.customerId !== undefined) {
        const { data: customer, error: customerError } = await client
          .from("customers")
          .select("id, customer_groups!left(price_list_id, is_active)")
          .eq("id", input.customerId)
          .eq("organization_id", input.organizationId)
          .maybeSingle();
        if (customerError !== null) throw customerError;
        if (customer === null) throw new Error("CUSTOMER_NOT_FOUND");
        const group = Array.isArray(customer.customer_groups)
          ? customer.customer_groups[0]
          : customer.customer_groups;
        if (group !== null && group?.is_active === true) {
          customerPriceListId = group.price_list_id;
        }
      }

      const listIds = customerPriceListId === null
        ? [defaultPriceList.id]
        : [customerPriceListId, defaultPriceList.id];

      const { data: priceRows, error: priceRowsError } = await client
        .from("price_list_items")
        .select("product_id, unit_price, price_list_id")
        .eq("organization_id", input.organizationId)
        .in("price_list_id", listIds)
        .in("product_id", productIds);
      if (priceRowsError !== null) throw priceRowsError;

      const customerPrices = new Map<string, ResolvedPriceData>();
      const defaultPrices = new Map<string, ResolvedPriceData>();

      for (const row of priceRows ?? []) {
        const price = {
          product_id: row.product_id,
          unit_price: Number(row.unit_price),
          price_source: row.price_list_id === customerPriceListId
            ? "customer_group_price_list" as const
            : customerPriceListId === null
            ? "default_price_list" as const
            : "fallback_default_price_list" as const,
          price_list_id: row.price_list_id,
        };
        if (row.price_list_id === customerPriceListId) {
          customerPrices.set(row.product_id, price);
        } else {
          defaultPrices.set(row.product_id, price);
        }
      }

      return productIds.map((productId) =>
        customerPrices.get(productId) ?? defaultPrices.get(productId) ?? {
          product_id: productId,
          unit_price: 0,
          price_source: customerPriceListId === null ? "default_price_list" : "fallback_default_price_list",
          price_list_id: defaultPriceList.id,
        }
      );
    },
  };
}

async function nextCustomerCode(client: DatabaseClient, organizationId: string): Promise<string> {
  const { data, error } = await client.rpc("next_customer_code", { p_organization_id: organizationId });
  if (error !== null) throw error;
  if (typeof data !== "string") throw new Error("CUSTOMER_CODE_REQUIRED");
  return data;
}

function toCustomerData(row: {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  customer_group_id: string | null;
  customer_groups?: { id: string; code: string; name: string } | Array<{ id: string; code: string; name: string }> | null;
}): CustomerData {
  const group = Array.isArray(row.customer_groups) ? row.customer_groups[0] : row.customer_groups;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    phone: row.phone,
    customer_group_id: row.customer_group_id,
    customer_group: group ?? null,
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
