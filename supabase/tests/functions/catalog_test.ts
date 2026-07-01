import { createApp } from "../../functions/api/app.ts";
import type {
  CurrentUserRecord,
  FoundationRepository,
  PermissionCode,
  UserListItem,
} from "../../functions/api/contracts.ts";
import type { AuthClient } from "../../functions/api/middleware/auth.ts";

const actorId = "90000000-0000-4000-8000-000000000001";
const organizationId = "90000000-0000-4000-8000-000000000101";

function assertEquals<T>(actual: T, expected: T): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function auth(): AuthClient {
  return { getUser: () => Promise.resolve({ user: { id: actorId, email: "admin@example.test" } }) };
}

function currentUser(permissions: PermissionCode[]): CurrentUserRecord {
  return {
    user: { id: actorId, email: "admin@example.test", displayName: "Admin" },
    organization: { id: organizationId, code: "VAN-LAM", name: "Xưởng Văn Lâm" },
    workstation: null,
    permissions,
    workstationInvalid: false,
  };
}

const user: UserListItem = {
  id: "u-1",
  email: "cashier@example.test",
  display_name: "Cashier",
  status: "active",
  permissions: ["perm.create_order"],
};

function repo(
  permissions: PermissionCode[],
  overrides: Record<string, unknown> = {},
): FoundationRepository {
  const base = {
    getCurrentUser: () => Promise.resolve(currentUser(permissions)),
    listWorkstations: () => Promise.resolve([]),
    createWorkstation: () => {
      throw new Error("not implemented");
    },
    updateWorkstation: () => Promise.resolve(null),
    listUsers: () => Promise.resolve({ items: [user], total: 1 }),
    getUser: () => Promise.resolve(user),
    createUser: () => Promise.resolve(user),
    updateUser: () => Promise.resolve(user),
    replaceUserPermissions: () => Promise.resolve(user),
    listPermissions: () => Promise.resolve([]),
    listProducts: () =>
      Promise.resolve({
        items: [
          {
            id: "p-1",
            code: "MICA-3MM",
            name: "Mica 3mm",
            status: "active",
            unit_name: "m",
            sell_method: "linear_m",
          },
        ],
        total: 1,
      }),
    createProduct: () =>
      Promise.resolve({
        id: "p-new",
        code: "DECAL",
        name: "Decal",
        status: "active",
        unit_name: "m²",
        sell_method: "area_m2",
      }),
    updateProduct: () =>
      Promise.resolve({
        id: "p-1",
        code: "MICA-3MM",
        name: "Mica 3mm",
        status: "inactive",
        unit_name: "m",
        sell_method: "linear_m",
      }),
    listPriceLists: () =>
      Promise.resolve([
        {
          id: "pl-1",
          code: "DEFAULT",
          name: "Bảng giá chung",
          is_default: true,
          is_active: true,
        },
      ]),
    createPriceList: () =>
      Promise.resolve({
        id: "pl-2",
        code: "DAILY",
        name: "Bảng giá đại lý",
        is_default: false,
        is_active: true,
      }),
    updatePriceList: () =>
      Promise.resolve({
        id: "pl-1",
        code: "DEFAULT",
        name: "Bảng giá chung",
        is_default: true,
        is_active: true,
      }),
    upsertPriceListItem: () =>
      Promise.resolve({
        product_id: "p-1",
        unit_price: 120000,
        price_source: "default_price_list",
        price_list_id: "pl-1",
      }),
    deletePriceListItem: () => Promise.resolve(true),
    resolvePrices: () =>
      Promise.resolve([
        {
          product_id: "p-1",
          unit_price: 120000,
          price_source: "default_price_list",
          price_list_id: "pl-1",
        },
      ]),
    ...overrides,
  };

  return base as unknown as FoundationRepository;
}

async function call(
  path: string,
  init: RequestInit,
  repository: FoundationRepository,
): Promise<Response> {
  return await createApp({
    version: "test",
    auth: auth(),
    repository,
  })(
    new Request(`http://local${path}`, {
      ...init,
      headers: {
        authorization: "Bearer token",
        "content-type": "application/json",
        "x-request-id": "trace-catalog",
        ...init.headers,
      },
    }),
  );
}

async function data(response: Response): Promise<unknown> {
  return (await response.json()).data;
}

Deno.test("catalog routes require account permissions", async () => {
  assertEquals((await call("/api/v1/products", { method: "GET" }, repo(["perm.create_order"]))).status, 200);
  assertEquals(
    (await call(
      "/api/v1/products",
      {
        method: "POST",
        body: JSON.stringify({
          code: "DECAL",
          name: "Decal",
          status: "active",
          unit_name: "m²",
          sell_method: "area_m2",
        }),
      },
      repo(["perm.edit_price_book"]),
    )).status,
    201,
  );
  assertEquals((await call("/api/v1/products", { method: "GET" }, repo([]))).status, 403);
});

Deno.test("product search hides inactive products for POS users", async () => {
  let requestedStatus: string | null = null;
  const repository = repo(["perm.create_order"], {
    listProducts: (input: { status: string }) => {
      requestedStatus = input.status;
      return Promise.resolve({ items: [], total: 0 });
    },
  });

  const response = await call("/api/v1/products?status=all", { method: "GET" }, repository);

  assertEquals(response.status, 200);
  assertEquals(requestedStatus, "active");
});

Deno.test("price resolution uses default price list without discount model", async () => {
  const response = await call(
    "/api/v1/pricing/resolve",
    { method: "POST", body: JSON.stringify({ product_ids: ["p-1"] }) },
    repo(["perm.create_order"]),
  );

  assertEquals(response.status, 200);
  const body = await data(response) as { items: Array<Record<string, unknown>> };
  assertEquals(body.items[0].unit_price, 120000);
  assertEquals(body.items[0].price_source, "default_price_list");
  assert(!("discount_rate" in body.items[0]), "price response must not include discount_rate");
  assert(!("discount_items" in body.items[0]), "price response must not include discount_items");
});

Deno.test("customer routes normalize optional phone and auto code", async () => {
  const receivedInputs: Array<{
    code?: string;
    name: string;
    phone?: string;
    customerGroupId?: string | null;
  }> = [];
  const repository = repo(["perm.create_order"], {
    createCustomer: (input: {
      code?: string;
      name: string;
      phone?: string;
      customerGroupId?: string | null;
    }) => {
      receivedInputs.push(input);
      return Promise.resolve({
        id: "customer-1",
        code: input.code ?? "KH000002",
        name: input.name,
        phone: input.phone ?? null,
        customer_group_id: input.customerGroupId ?? null,
        customer_group: null,
      });
    },
  });

  const response = await call(
    "/api/v1/customers",
    {
      method: "POST",
      body: JSON.stringify({ name: " Cong ty ABC ", phone: " 090 123 4567 " }),
    },
    repository,
  );

  const body = await data(response) as Record<string, unknown>;
  assertEquals(response.status, 201);
  assertEquals(receivedInputs[0].code, undefined);
  assertEquals(receivedInputs[0].name, "Cong ty ABC");
  assertEquals(receivedInputs[0].phone, "090 123 4567");
  assertEquals(body.code, "KH000002");
  assertEquals(body.name, "Cong ty ABC");
});

Deno.test("price resolution accepts a customer id", async () => {
  let receivedCustomerId: string | undefined;
  const repository = repo(["perm.create_order"], {
    resolvePrices: (input: { productIds: string[]; customerId?: string }) => {
      receivedCustomerId = input.customerId;
      return Promise.resolve([
        {
          product_id: input.productIds[0],
          unit_price: input.customerId === "customer-1" ? 100000 : 120000,
          price_source: "customer_group_price_list",
          price_list_id: "price-list-2",
        },
      ]);
    },
  });

  const response = await call(
    "/api/v1/pricing/resolve",
    { method: "POST", body: JSON.stringify({ product_ids: ["p-1"], customer_id: "customer-1" }) },
    repository,
  );

  const body = await data(response) as { items: Array<Record<string, unknown>> };
  assertEquals(response.status, 200);
  assertEquals(receivedCustomerId, "customer-1");
  assertEquals(body.items[0].unit_price, 100000);
  assertEquals(body.items[0].price_source, "customer_group_price_list");
});

Deno.test("price formula preview requires edit_price_book and returns computed rows", async () => {
  const response = await call(
    "/api/v1/price-lists/formulas/preview",
    {
      method: "POST",
      body: JSON.stringify({
        name: "Fomex",
        product_filter: { name_contains: "Mica" },
        cost_formula: { type: "fixed", amount: 5000 },
        profit_formula: { type: "fixed", amount: 25000 },
        price_list_adjustments: { "pl-1": { type: "amount", amount: 20000 } },
      }),
    },
    repo(["perm.edit_price_book"], {
      previewPriceFormula: () =>
        Promise.resolve({
          affected_count: 1,
          items: [
            {
              product_id: "p-1",
              product_code: "MICA-3MM",
              product_name: "Mica 3mm",
              latest_purchase_cost: 100000,
              current_mode: "manual",
              current_unit_price: 120000,
              computed_prices: [
                {
                  price_list_id: "pl-1",
                  price_list_name: "Bảng giá chung",
                  current_unit_price: 120000,
                  computed_unit_price: 150000,
                  delta: 30000,
                },
              ],
            },
          ],
        }),
    }),
  );

  assertEquals(response.status, 200);
  const body = await data(response) as { affected_count: number };
  assertEquals(body.affected_count, 1);
});

Deno.test("price formula preview is blocked without edit_price_book", async () => {
  const response = await call(
    "/api/v1/price-lists/formulas/preview",
    {
      method: "POST",
      body: JSON.stringify({
        name: "Fomex",
        product_filter: {},
        cost_formula: { type: "fixed", amount: 5000 },
        profit_formula: { type: "fixed", amount: 25000 },
        price_list_adjustments: {},
      }),
    },
    repo(["perm.create_order"]),
  );

  assertEquals(response.status, 403);
});

Deno.test("price formula apply persists selected formula cells", async () => {
  let receivedActorUserId: string | undefined;
  let receivedSelectionCount = 0;
  const response = await call(
    "/api/v1/price-lists/formulas/apply",
    {
      method: "POST",
      body: JSON.stringify({
        formula: {
          name: "Fomex",
          product_filter: {},
          cost_formula: { type: "fixed", amount: 5000 },
          profit_formula: { type: "fixed", amount: 25000 },
          price_list_adjustments: { "pl-1": { type: "amount", amount: 20000 } },
        },
        selected_items: [{ product_id: "p-1", price_list_id: "pl-1" }],
      }),
    },
    repo(["perm.edit_price_book"], {
      applyPriceFormula: (input: { actorUserId: string; selectedItems: unknown[] }) => {
        receivedActorUserId = input.actorUserId;
        receivedSelectionCount = input.selectedItems.length;
        return Promise.resolve({ formula_rule_id: "rule-1", affected_count: 1 });
      },
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(receivedActorUserId, actorId);
  assertEquals(receivedSelectionCount, 1);
  const body = await data(response) as { affected_count: number };
  assertEquals(body.affected_count, 1);
});
