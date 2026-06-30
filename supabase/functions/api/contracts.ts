export type PermissionCode = `perm.${string}`;
export type ProductStatus = "active" | "inactive";
export type SellMethod = "quantity" | "area_m2" | "linear_m" | "sheet" | "combo";
export type PriceSource = "default_price_list" | "customer_group_price_list" | "fallback_default_price_list";

export interface RequestContext {
  traceId: string;
  userId: string;
  email: string;
  organizationId: string;
  workstationId: string | null;
  permissions: ReadonlySet<PermissionCode>;
}

export interface WorkstationData {
  id: string;
  code: string;
  name: string;
  status: "active" | "inactive";
}

export interface UserListItem {
  id: string;
  email: string;
  display_name: string;
  status: "active" | "inactive";
  permissions: PermissionCode[];
}

export interface PermissionData {
  code: PermissionCode;
  module: string;
  description: string;
}

export interface ProductData {
  id: string;
  code: string;
  name: string;
  status: ProductStatus;
  unit_name: string;
  sell_method: SellMethod;
}

export interface PriceListData {
  id: string;
  code: string;
  name: string;
  is_default: boolean;
  is_active: boolean;
}

export interface CustomerGroupData {
  id: string;
  code: string;
  name: string;
  price_list_id: string;
  is_active: boolean;
}

export interface CustomerData {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  customer_group_id: string | null;
  customer_group: { id: string; code: string; name: string } | null;
}

export interface ResolvedPriceData {
  product_id: string;
  unit_price: number;
  price_source: PriceSource;
  price_list_id: string;
}

export interface CheckoutOrderSummaryData {
  id: string;
  code: string;
  order_type: "invoice";
  status: "completed";
  total_amount: number;
  paid_amount: number;
  debt_amount: number;
  payment_status: "unpaid" | "partial" | "paid";
}

export interface CheckoutPaymentReceiptData {
  id: string;
  code: string;
  total_received_amount: number;
}

export interface InventoryWarningData {
  product_id: string;
  code: string;
  message: string;
}

export interface CheckoutResultData {
  order: CheckoutOrderSummaryData;
  payment_receipt: CheckoutPaymentReceiptData | null;
  inventory_warnings: InventoryWarningData[];
}

export interface FinanceAccountData {
  id: string;
  code: string;
  name: string;
  account_type: "cash" | "bank";
  is_default_cash: boolean;
  is_active: boolean;
}

export interface CustomerDebtSummaryData {
  customer_id: string | null;
  customer_code: string | null;
  customer_name: string;
  total_debt: number;
  oldest_order_code: string | null;
  open_invoice_count: number;
}

export interface CustomerDebtDetailData {
  customer_id: string;
  total_debt: number;
  invoices: Array<{
    order_id: string;
    order_code: string;
    total_amount: number;
    paid_amount: number;
    debt_amount: number;
    remaining_debt: number;
  }>;
}

export interface DebtCollectionResultData {
  payment_receipt_id: string;
  allocated_amount: number;
}

export interface CashbookBalanceData {
  finance_account_id: string;
  code: string;
  name: string;
  account_type: "cash" | "bank";
  balance: number;
}

export interface CashbookVoucherData {
  id: string;
  code: string;
  source_type: "payment_receipt" | "manual_voucher";
  status: "posted" | "cancelled";
  amount: number;
}

export interface ReconciliationData {
  id: string;
  code: string;
  status: "draft" | "balanced" | "cancelled";
  period_start: string;
  period_end: string;
}

export interface InventoryProductData {
  product_id: string;
  code: string;
  name: string;
  status: ProductStatus;
  inventory_shape: "normal" | "roll" | "sheet";
  stock_unit: string;
  available_qty: number;
  is_negative: boolean;
}

export interface StockMovementData {
  id: string;
  product_id: string;
  movement_type: string;
  quantity_delta: number;
  created_at: string;
}

export interface StocktakeData {
  id: string;
  code: string;
  status: "draft" | "balanced" | "cancelled";
  source_type: "manual" | "product_edit";
  created_at: string;
  balanced_at: string | null;
  note: string | null;
}

export interface CurrentUserData {
  user: { id: string; email: string; display_name: string };
  organization: { id: string; code: string; name: string };
  workstation: { id: string; code: string; name: string } | null;
  permissions: PermissionCode[];
}

export interface CurrentUserRecord {
  user: { id: string; email: string; displayName: string };
  organization: { id: string; code: string; name: string };
  workstation: { id: string; code: string; name: string } | null;
  permissions: PermissionCode[];
  workstationInvalid: boolean;
}

export interface GetCurrentUserInput {
  userId: string;
  email: string;
  workstationId: string | null;
}

export interface FoundationRepository {
  getCurrentUser(input: GetCurrentUserInput): Promise<CurrentUserRecord | null>;
  listWorkstations(organizationId: string): Promise<WorkstationData[]>;
  createWorkstation(input: {
    organizationId: string;
    code: string;
    name: string;
  }): Promise<WorkstationData>;
  updateWorkstation(input: {
    organizationId: string;
    id: string;
    code?: string;
    name?: string;
    status?: "active" | "inactive";
  }): Promise<WorkstationData | null>;
  listUsers(input: {
    organizationId: string;
    search?: string;
    status?: "active" | "inactive";
    page: number;
    pageSize: number;
  }): Promise<{ items: UserListItem[]; total: number }>;
  getUser(input: { organizationId: string; userId: string }): Promise<UserListItem | null>;
  createUser(input: {
    organizationId: string;
    email: string;
    password: string;
    displayName: string;
    permissions: PermissionCode[];
    actorUserId: string;
    traceId: string;
  }): Promise<UserListItem>;
  updateUser(input: {
    organizationId: string;
    userId: string;
    displayName?: string;
    status?: "active" | "inactive";
    actorUserId: string;
  }): Promise<UserListItem | null>;
  replaceUserPermissions(input: {
    organizationId: string;
    userId: string;
    permissions: PermissionCode[];
    actorUserId: string;
    traceId: string;
  }): Promise<UserListItem | null>;
  listPermissions(): Promise<PermissionData[]>;
  listProducts(input: {
    organizationId: string;
    search?: string;
    status: ProductStatus | "all";
    page: number;
    pageSize: number;
  }): Promise<{ items: ProductData[]; total: number }>;
  createProduct(input: {
    organizationId: string;
    code: string;
    name: string;
    status: ProductStatus;
    unitName: string;
    sellMethod: SellMethod;
  }): Promise<ProductData>;
  updateProduct(input: {
    organizationId: string;
    id: string;
    code?: string;
    name?: string;
    status?: ProductStatus;
    unitName?: string;
    sellMethod?: SellMethod;
  }): Promise<ProductData | null>;
  listPriceLists(input: { organizationId: string; activeOnly: boolean }): Promise<PriceListData[]>;
  createPriceList(input: {
    organizationId: string;
    code: string;
    name: string;
    isDefault: boolean;
  }): Promise<PriceListData>;
  updatePriceList(input: {
    organizationId: string;
    id: string;
    code?: string;
    name?: string;
    isDefault?: boolean;
    isActive?: boolean;
  }): Promise<PriceListData | null>;
  upsertPriceListItem(input: {
    organizationId: string;
    priceListId: string;
    productId: string;
    unitPrice: number;
  }): Promise<ResolvedPriceData>;
  deletePriceListItem(input: {
    organizationId: string;
    priceListId: string;
    productId: string;
  }): Promise<boolean>;
  listCustomers(input: {
    organizationId: string;
    search?: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: CustomerData[]; total: number }>;
  createCustomer(input: {
    organizationId: string;
    code?: string;
    name: string;
    phone?: string;
    customerGroupId?: string | null;
  }): Promise<CustomerData>;
  updateCustomer(input: {
    organizationId: string;
    id: string;
    code?: string;
    name?: string;
    phone?: string | null;
    customerGroupId?: string | null;
  }): Promise<CustomerData | null>;
  listCustomerGroups(input: { organizationId: string; activeOnly: boolean }): Promise<CustomerGroupData[]>;
  createCustomerGroup(input: {
    organizationId: string;
    code: string;
    name: string;
    priceListId: string;
  }): Promise<CustomerGroupData>;
  updateCustomerGroup(input: {
    organizationId: string;
    id: string;
    code?: string;
    name?: string;
    priceListId?: string;
    isActive?: boolean;
  }): Promise<CustomerGroupData | null>;
  resolvePrices(input: {
    organizationId: string;
    productIds: string[];
    customerId?: string;
  }): Promise<ResolvedPriceData[]>;
  checkoutOrder(input: {
    organizationId: string;
    actorUserId: string;
    payload: Record<string, unknown>;
  }): Promise<CheckoutResultData>;
  reviseInvoice(input: {
    organizationId: string;
    actorUserId: string;
    orderId: string;
    payload: Record<string, unknown>;
  }): Promise<Record<string, unknown>>;
  listFinanceAccounts(input: {
    organizationId: string;
    accountType?: "cash" | "bank";
    isActive?: boolean;
  }): Promise<FinanceAccountData[]>;
  listCustomerDebts(input: {
    organizationId: string;
    search?: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: CustomerDebtSummaryData[]; total: number }>;
  getCustomerDebt(input: { organizationId: string; customerId: string }): Promise<CustomerDebtDetailData | null>;
  collectCustomerDebt(input: {
    organizationId: string;
    actorUserId: string;
    payload: Record<string, unknown>;
  }): Promise<DebtCollectionResultData>;
  listCashbookBalances(input: { organizationId: string }): Promise<CashbookBalanceData[]>;
  listCashbookVouchers(input: { organizationId: string }): Promise<{ items: CashbookVoucherData[]; total: number }>;
  listReconciliations(input: { organizationId: string }): Promise<{ items: ReconciliationData[]; total: number }>;
  listInventoryProducts(input: {
    organizationId: string;
    search?: string;
    status: ProductStatus | "all";
    inventoryShape?: "normal" | "roll" | "sheet";
    page: number;
    pageSize: number;
  }): Promise<{ items: InventoryProductData[]; total: number }>;
  getInventoryProduct(input: { organizationId: string; productId: string }): Promise<InventoryProductData | null>;
  listStockMovements(input: {
    organizationId: string;
    productId?: string;
    orderId?: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: StockMovementData[]; total: number }>;
  listStocktakes(input: {
    organizationId: string;
    search?: string;
    status?: "draft" | "balanced" | "cancelled";
    createdFrom?: string;
    createdTo?: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: StocktakeData[]; total: number }>;
  adjustNormalProductStock(input: {
    organizationId: string;
    actorUserId: string;
    productId: string;
    actualQty: number;
    reason: string;
  }): Promise<StocktakeData>;
}
