import { createApp } from "../../functions/api/app.ts";
import type {
  CurrentUserRecord,
  FoundationRepository,
  PermissionCode,
  StocktakeData,
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

const stocktake: StocktakeData = {
  id: "stocktake-1",
  code: "KK000001",
  status: "balanced",
  source_type: "product_edit",
  created_at: "2026-07-01T00:00:00Z",
  balanced_at: "2026-07-01T00:00:00Z",
  note: "Phiếu kiểm kho được tạo tự động khi cập nhật Hàng hóa: Standee chữ X (STANDEE)",
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
    listProducts: () => Promise.resolve({ items: [], total: 0 }),
    createProduct: () => {
      throw new Error("not implemented");
    },
    updateProduct: () => Promise.resolve(null),
    listPriceLists: () => Promise.resolve([]),
    createPriceList: () => {
      throw new Error("not implemented");
    },
    updatePriceList: () => Promise.resolve(null),
    upsertPriceListItem: () => {
      throw new Error("not implemented");
    },
    deletePriceListItem: () => Promise.resolve(false),
    resolvePrices: () => Promise.resolve([]),
    listCustomers: () => Promise.resolve({ items: [], total: 0 }),
    createCustomer: () => {
      throw new Error("not implemented");
    },
    updateCustomer: () => Promise.resolve(null),
    listCustomerGroups: () => Promise.resolve([]),
    createCustomerGroup: () => {
      throw new Error("not implemented");
    },
    updateCustomerGroup: () => Promise.resolve(null),
    checkoutOrder: () => {
      throw new Error("not implemented");
    },
    reviseInvoice: () => Promise.resolve({}),
    listFinanceAccounts: () =>
      Promise.resolve([
        {
          id: "cash-1",
          code: "CASH",
          name: "Quỹ tiền mặt",
          account_type: "cash",
          is_default_cash: true,
          is_active: true,
        },
      ]),
    listCustomerDebts: () => Promise.resolve({ items: [], total: 0 }),
    getCustomerDebt: () => Promise.resolve(null),
    collectCustomerDebt: () => Promise.resolve({ payment_receipt_id: "receipt-1", allocated_amount: 100000 }),
    listCashbookBalances: () => Promise.resolve([]),
    listCashbookVouchers: () => Promise.resolve({ items: [], total: 0 }),
    listReconciliations: () => Promise.resolve({ items: [], total: 0 }),
    listInventoryProducts: () =>
      Promise.resolve({
        items: [
          {
            product_id: "p-1",
            code: "STANDEE",
            name: "Standee chữ X",
            status: "active",
            inventory_shape: "normal",
            stock_unit: "cái",
            available_qty: 10,
            is_negative: false,
          },
        ],
        total: 1,
      }),
    getInventoryProduct: () =>
      Promise.resolve({
        product_id: "p-1",
        code: "STANDEE",
        name: "Standee chữ X",
        status: "active",
        inventory_shape: "normal",
        stock_unit: "cái",
        available_qty: 10,
        is_negative: false,
      }),
    listStockMovements: () => Promise.resolve({ items: [], total: 0 }),
    listStocktakes: () => Promise.resolve({ items: [stocktake], total: 1 }),
    adjustNormalProductStock: () => Promise.resolve(stocktake),
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
        "x-request-id": "trace-inventory-finance",
        ...init.headers,
      },
    }),
  );
}

async function data(response: Response): Promise<unknown> {
  return (await response.json()).data;
}

Deno.test("finance accounts require view_shift_report or manage_finance", async () => {
  assertEquals((await call("/api/v1/finance/accounts", { method: "GET" }, repo([]))).status, 403);
  assertEquals((await call("/api/v1/finance/accounts", { method: "GET" }, repo(["perm.view_shift_report"]))).status, 200);
  assertEquals((await call("/api/v1/finance/accounts", { method: "GET" }, repo(["perm.manage_finance"]))).status, 200);
});

Deno.test("debt collection rejects overpayment", async () => {
  const response = await call(
    "/api/v1/finance/debt-collections",
    {
      method: "POST",
      body: JSON.stringify({
        customer_id: "customer-1",
        amount: 500000,
        payment_method: { cash_amount: 500000, bank_amount: 0 },
      }),
    },
    repo(["perm.manage_finance"], {
      collectCustomerDebt: () => {
        throw { code: "22023", message: "debt collection cannot exceed outstanding debt" };
      },
    }),
  );

  assertEquals(response.status, 400);
});

Deno.test("source-linked cashbook vouchers cannot be edited independently", async () => {
  const response = await call(
    "/api/v1/finance/cashbook-vouchers/source-linked-1/revise",
    { method: "POST", body: JSON.stringify({ reason: "test" }) },
    repo(["perm.manage_finance"]),
  );

  assertEquals(response.status, 404);
});

Deno.test("inventory products hide inactive rows for create_order-only actor", async () => {
  let requestedStatus = "";
  const response = await call(
    "/api/v1/inventory/products?status=all",
    { method: "GET" },
    repo(["perm.create_order"], {
      listInventoryProducts: (input: { status: string }) => {
        requestedStatus = input.status;
        return Promise.resolve({ items: [], total: 0 });
      },
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(requestedStatus, "active");
});

Deno.test("normal product stock adjustment creates balanced stocktake", async () => {
  const response = await call(
    "/api/v1/inventory/products/p-1/adjust-stock",
    { method: "POST", body: JSON.stringify({ actual_qty: 12, reason: "Cập nhật tồn từ trang Hàng hóa" }) },
    repo(["perm.manage_inventory"]),
  );

  const result = await data(response) as StocktakeData;
  assertEquals(response.status, 201);
  assertEquals(result.status, "balanced");
  assertEquals(result.source_type, "product_edit");
});

Deno.test("stocktake list accepts long date ranges when default period is empty", async () => {
  let createdFrom = "";
  let createdTo = "";
  const response = await call(
    "/api/v1/inventory/stocktakes?created_from=2016-07-01&created_to=2026-07-01",
    { method: "GET" },
    repo(["perm.manage_inventory"], {
      listStocktakes: (input: { createdFrom?: string; createdTo?: string }) => {
        createdFrom = input.createdFrom ?? "";
        createdTo = input.createdTo ?? "";
        return Promise.resolve({ items: [stocktake], total: 1 });
      },
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(createdFrom, "2016-07-01");
  assertEquals(createdTo, "2026-07-01");
});

Deno.test("roll and sheet products reject total stock adjustment", async () => {
  const response = await call(
    "/api/v1/inventory/products/roll-product/adjust-stock",
    { method: "POST", body: JSON.stringify({ actual_qty: 12, reason: "Sai luồng" }) },
    repo(["perm.manage_inventory"], {
      adjustNormalProductStock: () => {
        throw { code: "22023", message: "roll and sheet products reject total stock adjustment" };
      },
    }),
  );

  assertEquals(response.status, 400);
});
