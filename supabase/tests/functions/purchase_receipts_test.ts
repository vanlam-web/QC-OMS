import { createApp } from "../../functions/api/app.ts";
import type {
  CurrentUserRecord,
  FoundationRepository,
  PermissionCode,
  PurchaseReceiptData,
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

const receipt: PurchaseReceiptData = {
  id: "receipt-1",
  code: "PN000673",
  supplier_id: "supplier-1",
  supplier: { id: "supplier-1", code: "NCC000031", name: "Nguyễn Phong" },
  received_at: "2026-07-01T03:00:00.000Z",
  status: "draft",
  supplier_document_no: "HD-NCC-001",
  subtotal_amount: 190000,
  discount_amount: 10000,
  payable_amount: 180000,
  paid_amount: 50000,
  remaining_amount: 130000,
  notes: "Nhập hàng thường",
  created_by: actorId,
  created_at: "2026-07-01T03:00:00.000Z",
  updated_at: "2026-07-01T03:00:00.000Z",
  items: [
    {
      id: "item-1",
      product_id: "product-1",
      product: { id: "product-1", code: "SP0001", name: "Decal sữa" },
      line_no: 1,
      inventory_shape: "normal",
      unit_name_snapshot: "m",
      quantity: 2,
      unit_cost: 100000,
      discount_amount: 10000,
      line_amount: 190000,
    },
  ],
};

function repo(
  permissions: PermissionCode[],
  overrides: Record<string, unknown> = {},
): FoundationRepository {
  return {
    getCurrentUser: () => Promise.resolve(currentUser(permissions)),
    listPurchaseReceipts: () => Promise.resolve({ items: [receipt], total: 1 }),
    getPurchaseReceipt: () => Promise.resolve(receipt),
    createPurchaseReceipt: () => Promise.resolve(receipt),
    updatePurchaseReceipt: () => Promise.resolve({ ...receipt, notes: "Đã sửa" }),
    ...overrides,
  } as unknown as FoundationRepository;
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
        "x-request-id": "trace-purchase-receipts",
        ...init.headers,
      },
    }),
  );
}

async function data(response: Response): Promise<unknown> {
  return (await response.json()).data;
}

Deno.test("purchase receipt routes require manage inventory permission", async () => {
  assertEquals((await call("/api/v1/purchase/receipts", { method: "GET" }, repo(["perm.manage_inventory"]))).status, 200);
  assertEquals((await call("/api/v1/purchase/receipts", { method: "GET" }, repo(["perm.create_order"]))).status, 403);
});

Deno.test("purchase receipt list maps filters and exact PN search", async () => {
  let captured: Record<string, unknown> | null = null;
  const repository = repo(["perm.manage_inventory"], {
    listPurchaseReceipts: (input: Record<string, unknown>) => {
      captured = input;
      return Promise.resolve({ items: [receipt], total: 1 });
    },
  });

  const response = await call(
    "/api/v1/purchase/receipts?q=PN000673&status=all&date_from=2026-06-01&date_to=2026-07-31",
    { method: "GET" },
    repository,
  );

  assertEquals(response.status, 200);
  assertEquals(captured, {
    organizationId,
    search: "PN000673",
    status: "all",
    dateFrom: "2026-06-01",
    dateTo: "2026-07-31",
    page: 1,
    pageSize: 20,
  });
  const body = await data(response) as { items: PurchaseReceiptData[]; total: number };
  assertEquals(body.items[0].code, "PN000673");
  assertEquals(body.items[0].payable_amount, 180000);
});

Deno.test("purchase receipt create normalizes draft input and lines", async () => {
  let captured: Record<string, unknown> | null = null;
  const repository = repo(["perm.manage_inventory"], {
    createPurchaseReceipt: (input: Record<string, unknown>) => {
      captured = input;
      return Promise.resolve(receipt);
    },
  });

  const response = await call(
    "/api/v1/purchase/receipts",
    {
      method: "POST",
      body: JSON.stringify({
        code: "",
        supplier_id: "supplier-1",
        received_at: "2026-07-01T10:00:00+07:00",
        supplier_document_no: "HD-NCC-001",
        notes: "Nhập hàng thường",
        discount_amount: 10000,
        paid_amount: 50000,
        items: [
          {
            product_id: "product-1",
            unit_name: "m",
            quantity: 2,
            unit_cost: 100000,
            discount_amount: 10000,
          },
        ],
      }),
    },
    repository,
  );

  assertEquals(response.status, 201);
  assertEquals(captured, {
    organizationId,
    actorUserId: actorId,
    supplierId: "supplier-1",
    receivedAt: "2026-07-01T10:00:00+07:00",
    discountAmount: 10000,
    paidAmount: 50000,
    items: [
      {
        productId: "product-1",
        unitName: "m",
        quantity: 2,
        unitCost: 100000,
        discountAmount: 10000,
      },
    ],
    supplierDocumentNo: "HD-NCC-001",
    notes: "Nhập hàng thường",
  });
});

Deno.test("purchase receipt update is draft-only and maps optional fields", async () => {
  let captured: Record<string, unknown> | null = null;
  const repository = repo(["perm.manage_inventory"], {
    updatePurchaseReceipt: (input: Record<string, unknown>) => {
      captured = input;
      return Promise.resolve({ ...receipt, notes: "Đã sửa" });
    },
  });

  const response = await call(
    "/api/v1/purchase/receipts/receipt-1",
    {
      method: "PATCH",
      body: JSON.stringify({
        notes: "Đã sửa",
        paid_amount: 0,
        items: [
          { product_id: "product-1", unit_name: "m", quantity: 3, unit_cost: 90000, discount_amount: 0 },
        ],
      }),
    },
    repository,
  );

  assertEquals(response.status, 200);
  assertEquals(captured, {
    organizationId,
    actorUserId: actorId,
    id: "receipt-1",
    notes: "Đã sửa",
    paidAmount: 0,
    items: [
      {
        productId: "product-1",
        unitName: "m",
        quantity: 3,
        unitCost: 90000,
        discountAmount: 0,
      },
    ],
  });
});

Deno.test("purchase receipt detail returns draft lines", async () => {
  const response = await call("/api/v1/purchase/receipts/receipt-1", { method: "GET" }, repo(["perm.manage_inventory"]));

  assertEquals(response.status, 200);
  const body = await data(response) as PurchaseReceiptData;
  assertEquals(body.items[0].line_amount, 190000);
});

Deno.test("purchase receipt routes reject duplicate products before repository call", async () => {
  const response = await call(
    "/api/v1/purchase/receipts",
    {
      method: "POST",
      body: JSON.stringify({
        supplier_id: "supplier-1",
        received_at: "2026-07-01T10:00:00+07:00",
        items: [
          { product_id: "product-1", unit_name: "m", quantity: 1, unit_cost: 100000, discount_amount: 0 },
          { product_id: "product-1", unit_name: "m", quantity: 1, unit_cost: 100000, discount_amount: 0 },
        ],
      }),
    },
    repo(["perm.manage_inventory"], {
      createPurchaseReceipt: () => {
        throw new Error("repository should not be called for duplicate products");
      },
    }),
  );

  assertEquals(response.status, 400);
  const body = await response.json() as { error: { code: string } };
  assertEquals(body.error.code, "VALIDATION_ERROR");
});

Deno.test("purchase receipt post and cancel are not implemented in P2", async () => {
  assertEquals(
    (await call("/api/v1/purchase/receipts/receipt-1/post", { method: "POST" }, repo(["perm.manage_inventory"]))).status,
    405,
  );
  assertEquals(
    (await call("/api/v1/purchase/receipts/receipt-1/cancel", { method: "POST" }, repo(["perm.manage_inventory"]))).status,
    405,
  );
});
