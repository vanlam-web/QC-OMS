import { createApp } from "../../functions/api/app.ts";
import type {
  CurrentUserRecord,
  FoundationRepository,
  PermissionCode,
  PaymentReceiptDetailData,
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

const receiptDetail: PaymentReceiptDetailData = {
  id: "receipt-1",
  code: "TTHD010973",
  status: "posted",
  receipt_type: "sale_payment",
  total_received_amount: 120000,
  created_at: "2026-06-30T10:00:00Z",
  customer: { id: "customer-1", code: "KH000001", name: "Cong ty ABC" },
  source_order: { id: "order-1", code: "HD010973", total_amount: 240000 },
  methods: [{ method_type: "cash", amount: 120000, finance_account: { id: "cash-1", code: "CASH", name: "Tiền mặt" } }],
  allocations: [
    {
      order_id: "order-1",
      order_code: "HD010973",
      order_total_amount: 240000,
      collected_before: 0,
      allocated_amount: 120000,
      remaining_after: 120000,
    },
  ],
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
    listCashbookEntries: () =>
      Promise.resolve({
        summary: { opening_balance: 0, total_in: 120000, total_out: 0, ending_balance: 120000 },
        items: [
          {
            id: "entry-1",
            code: "TTHD010973",
            status: "posted",
            direction: "in",
            amount_delta: 120000,
            finance_account: { id: "cash-1", code: "CASH", name: "Tiền mặt", account_type: "cash" },
            is_business_accounted: true,
            source_type: "payment_receipt_method",
            created_at: "2026-06-30T10:00:00Z",
            note: "Thu hóa đơn HD010973",
          },
        ],
        page: 1,
        page_size: 20,
        total: 1,
      }),
    getCashbookEntry: () =>
      Promise.resolve({
        id: "entry-1",
        code: "TTHD010973",
        status: "posted",
        direction: "in",
        amount_delta: 120000,
        finance_account: { id: "cash-1", code: "CASH", name: "Tiền mặt", account_type: "cash" },
        is_business_accounted: true,
        created_by: { id: actorId, name: "Admin" },
        counterparty: { type: "customer", name: "Cong ty ABC", phone: null },
        payment_method: "cash",
        note: "Thu hóa đơn HD010973",
        source: { type: "payment_receipt", id: "receipt-1", code: "TTHD010973", order_code: "HD010973" },
        allocations: receiptDetail.allocations,
      }),
    getPaymentReceipt: () => Promise.resolve(receiptDetail),
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

Deno.test("finance accounts allow finance or inventory management permissions", async () => {
  assertEquals((await call("/api/v1/finance/accounts", { method: "GET" }, repo([]))).status, 403);
  assertEquals((await call("/api/v1/finance/accounts", { method: "GET" }, repo(["perm.view_shift_report"]))).status, 200);
  assertEquals((await call("/api/v1/finance/accounts", { method: "GET" }, repo(["perm.manage_finance"]))).status, 200);
  assertEquals((await call("/api/v1/finance/accounts", { method: "GET" }, repo(["perm.manage_inventory"]))).status, 200);
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

Deno.test("manual cashbook voucher creation requires finance permission", async () => {
  const response = await call(
    "/api/v1/finance/cashbook-vouchers",
    {
      method: "POST",
      body: JSON.stringify({
        voucher_direction: "out",
        voucher_type: "operating_expense",
        finance_account_id: "cash-1",
        amount: 45000,
        reason: "Mua văn phòng phẩm",
      }),
    },
    repo(["perm.view_shift_report"]),
  );

  assertEquals(response.status, 403);
});

Deno.test("manual cashbook voucher creation validates payload and calls repository", async () => {
  let observed: Record<string, unknown> | null = null;
  const response = await call(
    "/api/v1/finance/cashbook-vouchers",
    {
      method: "POST",
      body: JSON.stringify({
        voucher_direction: "out",
        voucher_type: "operating_expense",
        finance_account_id: "cash-1",
        amount: 45000,
        is_business_accounted: false,
        counterparty_type: "employee",
        counterparty_name: "Nguyen Van A",
        counterparty_phone: "0900000000",
        reason: "Mua văn phòng phẩm",
      }),
    },
    repo(["perm.manage_finance"], {
      createCashbookVoucher: (input: Record<string, unknown>) => {
        observed = input;
        return Promise.resolve({
          id: "voucher-1",
          code: "PC000001",
          source_type: "manual_voucher",
          status: "posted",
          amount: 45000,
        });
      },
    }),
  );

  assertEquals(response.status, 201);
  assertEquals(observed, {
    organizationId,
    actorUserId: actorId,
    payload: {
      voucher_direction: "out",
      voucher_type: "operating_expense",
      finance_account_id: "cash-1",
      amount: 45000,
      is_business_accounted: false,
      counterparty_type: "employee",
      counterparty_name: "Nguyen Van A",
      counterparty_phone: "0900000000",
      reason: "Mua văn phòng phẩm",
    },
  });
  assertEquals(await data(response), {
    id: "voucher-1",
    code: "PC000001",
    source_type: "manual_voucher",
    status: "posted",
    amount: 45000,
  });
});

Deno.test("manual cashbook voucher cancel requires finance permission", async () => {
  const response = await call(
    "/api/v1/finance/cashbook-vouchers/voucher-1/cancel",
    { method: "POST" },
    repo(["perm.view_shift_report"]),
  );

  assertEquals(response.status, 403);
});

Deno.test("manual cashbook voucher cancel calls repository", async () => {
  let observed: Record<string, unknown> | null = null;
  const response = await call(
    "/api/v1/finance/cashbook-vouchers/voucher-1/cancel",
    { method: "POST" },
    repo(["perm.manage_finance"], {
      cancelCashbookVoucher: (input: Record<string, unknown>) => {
        observed = input;
        return Promise.resolve({
          id: "voucher-1",
          code: "PC000001",
          source_type: "manual_voucher",
          status: "cancelled",
          amount: 45000,
        });
      },
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(observed, {
    organizationId,
    actorUserId: actorId,
    voucherId: "voucher-1",
  });
  assertEquals(await data(response), {
    id: "voucher-1",
    code: "PC000001",
    source_type: "manual_voucher",
    status: "cancelled",
    amount: 45000,
  });
});

Deno.test("source-linked cashbook vouchers cannot be edited independently", async () => {
  const response = await call(
    "/api/v1/finance/cashbook-vouchers/source-linked-1/revise",
    { method: "POST", body: JSON.stringify({ reason: "test" }) },
    repo(["perm.manage_finance"]),
  );

  assertEquals(response.status, 404);
});

Deno.test("cashbook exact voucher search ignores default date filters", async () => {
  let observedFrom: string | undefined = "";
  let observedTo: string | undefined = "";
  const response = await call(
    "/api/v1/finance/cashbook?search=TTHD010973&from=2026-07-01&to=2026-07-31",
    { method: "GET" },
    repo(["perm.view_shift_report"], {
      listCashbookEntries: (input: { search?: string; from?: string; to?: string }) => {
        observedFrom = input.from;
        observedTo = input.to;
        assertEquals(input.search, "TTHD010973");
        return Promise.resolve({
          summary: { opening_balance: 0, total_in: 120000, total_out: 0, ending_balance: 120000 },
          items: [],
          page: 1,
          page_size: 20,
          total: 0,
        });
      },
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(observedFrom, undefined);
  assertEquals(observedTo, undefined);
});

Deno.test("cashbook scoped code search passes search scope and ignores default date filters", async () => {
  let observedSearchScope: string | undefined = "";
  let observedFrom: string | undefined = "";
  let observedTo: string | undefined = "";
  const response = await call(
    "/api/v1/finance/cashbook?search=CTM001180&search_scope=code&from=2026-07-01&to=2026-07-31&page=1&page_size=15",
    { method: "GET" },
    repo(["perm.manage_finance"], {
      listCashbookEntries: (input: { search?: string; searchScope?: string; from?: string; to?: string }) => {
        observedSearchScope = input.searchScope;
        observedFrom = input.from;
        observedTo = input.to;
        assertEquals(input.search, "CTM001180");
        return Promise.resolve({
          summary: { opening_balance: 0, total_in: 0, total_out: -30000, ending_balance: -30000 },
          items: [],
          page: 1,
          page_size: 15,
          total: 0,
        });
      },
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(observedSearchScope, "code");
  assertEquals(observedFrom, undefined);
  assertEquals(observedTo, undefined);
});

Deno.test("cashbook entry detail includes source and allocation snapshot", async () => {
  const response = await call(
    "/api/v1/finance/cashbook/entry-1",
    { method: "GET" },
    repo(["perm.manage_finance"]),
  );

  const result = await data(response) as Record<string, unknown>;
  assertEquals(response.status, 200);
  assertEquals(result.code, "TTHD010973");
  assertEquals((result.source as Record<string, unknown>).order_code, "HD010973");
  assertEquals((result.allocations as unknown[]).length, 1);
});

Deno.test("payment receipt detail includes methods and invoice allocations", async () => {
  const response = await call(
    "/api/v1/finance/payment-receipts/receipt-1",
    { method: "GET" },
    repo(["perm.view_shift_report"]),
  );

  const result = await data(response) as PaymentReceiptDetailData;
  assertEquals(response.status, 200);
  assertEquals(result.methods[0].finance_account.code, "CASH");
  assertEquals(result.allocations[0].order_code, "HD010973");
  assertEquals(result.allocations[0].remaining_after, 120000);
});

Deno.test("retail debts endpoint lists KH000001 open invoices", async () => {
  let observedOrganizationId = "";
  const response = await call(
    "/api/v1/finance/retail-debts",
    { method: "GET" },
    repo(["perm.manage_finance"], {
      listRetailDebts: (input: { organizationId: string }) => {
        observedOrganizationId = input.organizationId;
        return Promise.resolve({
          items: [
            {
              order_id: "order-retail-1",
              order_code: "HD000123",
              created_at: "2026-07-05T09:00:00Z",
              total_amount: 120000,
              paid_amount: 20000,
              debt_amount: 100000,
              remaining_debt: 100000,
              retail_debt_note: "Anh Nam 090...",
            },
          ],
          total: 1,
        });
      },
    }),
  );

  const result = await data(response) as { items: Array<{ order_code: string; retail_debt_note: string }>; total: number };
  assertEquals(response.status, 200);
  assertEquals(observedOrganizationId, organizationId);
  assertEquals(result.total, 1);
  assertEquals(result.items[0].order_code, "HD000123");
  assertEquals(result.items[0].retail_debt_note, "Anh Nam 090...");
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

Deno.test("material opening options require order or inventory permission", async () => {
  assertEquals(
    (await call("/api/v1/inventory/material-openings/options?product_id=p-1", { method: "GET" }, repo([]))).status,
    403,
  );
  assertEquals(
    (await call(
      "/api/v1/inventory/material-openings/options?product_id=p-1",
      { method: "GET" },
      repo(["perm.create_order"], {
        getMaterialOpeningOptions: () =>
          Promise.resolve({
            product: {
              id: "p-1",
              code: "STANDEE",
              name: "Standee chữ X",
              inventory_shape: "normal",
              stock_unit: { id: "unit-stock", code: "CAI", name: "Cái" },
            },
            conversions: [{ unit_id: "unit-pack", code: "RAM", name: "Ram", stock_qty_per_unit: 500 }],
            warnings: [],
          }),
      }),
    )).status,
    200,
  );
});

Deno.test("material opening options require product id and return conversions", async () => {
  let observedProductId = "";
  const missingProduct = await call(
    "/api/v1/inventory/material-openings/options",
    { method: "GET" },
    repo(["perm.create_order"]),
  );
  assertEquals(missingProduct.status, 400);

  const response = await call(
    "/api/v1/inventory/material-openings/options?product_id=p-1",
    { method: "GET" },
    repo(["perm.create_order"], {
      getMaterialOpeningOptions: (input: { productId: string }) => {
        observedProductId = input.productId;
        return Promise.resolve({
          product: {
            id: "p-1",
            code: "STANDEE",
            name: "Standee chữ X",
            inventory_shape: "normal",
            stock_unit: { id: "unit-stock", code: "CAI", name: "Cái" },
          },
          conversions: [{ unit_id: "unit-pack", code: "RAM", name: "Ram", stock_qty_per_unit: 500 }],
          warnings: [],
        });
      },
    }),
  );

  const result = await data(response) as {
    product: { code: string };
    conversions: Array<{ unit_id: string; stock_qty_per_unit: number }>;
  };
  assertEquals(response.status, 200);
  assertEquals(observedProductId, "p-1");
  assertEquals(result.product.code, "STANDEE");
  assertEquals(result.conversions[0].stock_qty_per_unit, 500);
});

Deno.test("normal material opening validates request and calls repository", async () => {
  let observedOpenedUnitId = "";
  const invalid = await call(
    "/api/v1/inventory/material-openings",
    { method: "POST", body: JSON.stringify({ product_id: "p-1", inventory_shape: "normal", opened_qty: 0 }) },
    repo(["perm.create_order"]),
  );
  assertEquals(invalid.status, 400);

  const response = await call(
    "/api/v1/inventory/material-openings",
    {
      method: "POST",
      body: JSON.stringify({
        product_id: "p-1",
        inventory_shape: "normal",
        opened_unit_id: "unit-pack",
        opened_qty: 1,
        old_remaining_qty: 0,
        note: " Khui ram giấy ",
      }),
    },
    repo(["perm.create_order"], {
      createMaterialOpening: (input: { openedUnitId: string; note?: string }) => {
        observedOpenedUnitId = input.openedUnitId;
        assertEquals(input.note, "Khui ram giấy");
        return Promise.resolve({
          id: "opening-1",
          product_id: "p-1",
          inventory_shape: "normal",
          source_type: "manual_normal",
          opened_unit_id: "unit-pack",
          opened_qty: 1,
          opened_stock_qty: 500,
          stock_movement_id: null,
          warnings: [],
          created_at: "2026-07-05T09:00:00Z",
        });
      },
    }),
  );

  const result = await data(response) as { id: string; opened_stock_qty: number; stock_movement_id: string | null };
  assertEquals(response.status, 201);
  assertEquals(observedOpenedUnitId, "unit-pack");
  assertEquals(result.opened_stock_qty, 500);
  assertEquals(result.stock_movement_id, null);
});

Deno.test("POS shortage preview requires order permission and returns normal product shortage", async () => {
  assertEquals(
    (await call(
      "/api/v1/inventory/pos-shortage-preview",
      { method: "POST", body: JSON.stringify({ product_id: "material-1", quantity: 5 }) },
      repo([]),
    )).status,
    403,
  );

  let observedProductId = "";
  let observedQuantity = 0;
  const response = await call(
    "/api/v1/inventory/pos-shortage-preview",
    { method: "POST", body: JSON.stringify({ product_id: "material-1", quantity: 5 }) },
    repo(["perm.create_order"], {
      previewPosMaterialShortage: (input: { productId: string; quantity: number }) => {
        observedProductId = input.productId;
        observedQuantity = input.quantity;
        return Promise.resolve({
          product_id: "material-1",
          quantity: 5,
          source: "product",
          shortages: [
            {
              product_id: "material-1",
              code: "GIAY-A4",
              name: "Giấy A4",
              required_qty: 5,
              available_qty: 2,
              shortage_qty: 3,
              stock_unit: { id: "unit-sheet", code: "TO", name: "Tờ" },
              inventory_shape: "normal",
              quick_material_opening_supported: true,
              conversion_options: [{ unit_id: "unit-ram", code: "RAM", name: "Ram", stock_qty_per_unit: 500 }],
            },
          ],
          warnings: [],
        });
      },
    }),
  );

  const result = await data(response) as {
    source: string;
    shortages: Array<{
      product_id: string;
      shortage_qty: number;
      quick_material_opening_supported: boolean;
      conversion_options: Array<{ unit_id: string; stock_qty_per_unit: number }>;
    }>;
  };
  assertEquals(response.status, 200);
  assertEquals(observedProductId, "material-1");
  assertEquals(observedQuantity, 5);
  assertEquals(result.source, "product");
  assertEquals(result.shortages[0].shortage_qty, 3);
  assertEquals(result.shortages[0].quick_material_opening_supported, true);
  assertEquals(result.shortages[0].conversion_options[0].stock_qty_per_unit, 500);
});

Deno.test("POS shortage preview returns standard single-level BOM normal component shortages", async () => {
  const response = await call(
    "/api/v1/inventory/pos-shortage-preview",
    { method: "POST", body: JSON.stringify({ product_id: "combo-1", quantity: 2 }) },
    repo(["perm.create_order"], {
      previewPosMaterialShortage: (input: { productId: string; quantity: number }) => {
        assertEquals(input.productId, "combo-1");
        assertEquals(input.quantity, 2);
        return Promise.resolve({
          product_id: "combo-1",
          quantity: 2,
          source: "standard_bom",
          bom_id: "bom-1",
          shortages: [
            {
              product_id: "material-1",
              code: "LED",
              name: "Bóng LED",
              required_qty: 10,
              available_qty: 4,
              shortage_qty: 6,
              stock_unit: { id: "unit-led", code: "CON", name: "Con" },
              inventory_shape: "normal",
              quick_material_opening_supported: false,
              conversion_options: [],
            },
          ],
          warnings: [],
        });
      },
    }),
  );

  const result = await data(response) as { source: string; bom_id: string; shortages: Array<{ code: string; required_qty: number }> };
  assertEquals(response.status, 200);
  assertEquals(result.source, "standard_bom");
  assertEquals(result.bom_id, "bom-1");
  assertEquals(result.shortages[0].code, "LED");
  assertEquals(result.shortages[0].required_qty, 10);
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
