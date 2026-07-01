export type PermissionCode = `perm.${string}`;
export type ProductStatus = "active" | "inactive";
export type SellMethod = "quantity" | "area_m2" | "linear_m" | "sheet" | "combo";
export type PriceSource =
  | "default_price_list"
  | "customer_group_price_list"
  | "fallback_default_price_list"
  | "latest_purchase_cost"
  | "latest_purchase_cost_missing_zero"
  | "price_formula"
  | "price_formula_missing_cost_zero";

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
  latest_purchase_cost: number | null;
  latest_purchase_cost_at: string | null;
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

export interface PriceFormulaPreviewPriceData {
  price_list_id: string;
  price_list_name: string;
  current_unit_price: number | null;
  computed_unit_price: number;
  delta: number | null;
}

export interface PriceFormulaPreviewItemData {
  product_id: string;
  product_code: string;
  product_name: string;
  latest_purchase_cost: number;
  current_mode: "manual" | "formula" | null;
  current_unit_price: number | null;
  computed_prices: PriceFormulaPreviewPriceData[];
}

export interface PriceFormulaPreviewData {
  affected_count: number;
  items: PriceFormulaPreviewItemData[];
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

export interface QuoteSummaryData {
  id: string;
  code: string;
  order_type: "quote";
  status: "active" | "converted" | "cancelled";
  total_amount: number;
}

export type QuoteReopenWarningCode =
  | "CURRENT_PRICE_DIFFERS"
  | "PRODUCT_INACTIVE"
  | "PRODUCT_MISSING"
  | "PRICE_LIST_INACTIVE"
  | "CUSTOMER_CHANGED";

export interface QuoteReopenWarningData {
  code: QuoteReopenWarningCode;
  message: string;
}

export interface QuoteReopenPayloadData {
  quote: {
    id: string;
    code: string;
    status: "active" | "converted" | "cancelled";
  };
  customer: {
    customer_id: string | null;
    snapshot: { code: string | null; name: string; phone: string | null };
    warnings: QuoteReopenWarningData[];
  };
  price_list: {
    price_list_id: string | null;
    snapshot: { code: string | null; name: string | null };
    warnings: QuoteReopenWarningData[];
  };
  items: Array<{
    order_item_id: string;
    product_id: string | null;
    product_snapshot: { code: string; name: string; unit_name: string; sell_method: SellMethod };
    quantity: number;
    width_m?: number | null;
    height_m?: number | null;
    linear_m?: number | null;
    unit_price: number;
    discount_amount: number;
    price_source: string;
    note: string | null;
    warnings: QuoteReopenWarningData[];
  }>;
  summary: { subtotal_amount: number; discount_amount: number; total_amount: number };
  note: string | null;
}

export interface SalesDocumentListItemData {
  id: string;
  code: string;
  order_type: "quote" | "invoice";
  status: "active" | "converted" | "completed" | "cancelled";
  created_at: string;
  customer: { id: string | null; code: string | null; name: string; phone: string | null };
  seller: { id: string; name: string };
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  debt_amount: number;
  payment_status: "not_applicable" | "unpaid" | "partial" | "paid";
  note: string | null;
}

export interface SalesDocumentDetailData extends SalesDocumentListItemData {
  price_list: { id: string; code: string; name: string } | null;
  change_returned_amount: number;
  items: Array<{
    id: string;
    line_no: number;
    product: { id: string | null; code: string; name: string; unit_name: string; sell_method: SellMethod };
    quantity: number;
    unit_price: number;
    line_subtotal_amount: number;
    discount_amount: number;
    line_total: number;
    price_source: string;
    note: string | null;
  }>;
  payment_receipts: Array<{
    id: string;
    code: string;
    total_received_amount: number;
    methods: Array<{
      method_type: "cash" | "bank_transfer";
      amount: number;
      finance_account: { id: string; code: string; name: string };
    }>;
    allocations: PaymentReceiptAllocationData[];
  }>;
  debt_entries: Array<{
    id: string;
    entry_type: "invoice_debt" | "debt_payment" | "debt_adjustment";
    amount_delta: number;
    balance_after_order: number;
    balance_after_customer: number;
    created_at: string;
  }>;
  stock_movements: StockMovementData[];
  history: Array<{ at: string; action: string; actor_name: string; note: string | null }>;
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

export interface CashbookEntryData {
  id: string;
  code: string;
  status: "posted" | "cancelled";
  direction: "in" | "out";
  amount_delta: number;
  finance_account: { id: string; code: string; name: string; account_type: "cash" | "bank" };
  is_business_accounted: boolean;
  source_type: "payment_receipt_method" | "cashbook_voucher";
  created_at: string;
  note: string | null;
}

export interface CashbookListData {
  summary: {
    opening_balance: number;
    total_in: number;
    total_out: number;
    ending_balance: number;
  };
  items: CashbookEntryData[];
  page: number;
  page_size: number;
  total: number;
}

export interface PaymentReceiptAllocationData {
  order_id: string;
  order_code: string;
  order_total_amount: number;
  collected_before: number;
  allocated_amount: number;
  remaining_after: number;
}

export interface CashbookEntryDetailData extends CashbookEntryData {
  created_by: { id: string; name: string };
  counterparty: { type: "customer" | "supplier" | "employee" | "other" | "none"; name: string | null; phone: string | null };
  payment_method: "cash" | "bank_transfer" | "manual";
  source: { type: "payment_receipt" | "manual_voucher"; id: string; code: string; order_code: string | null };
  allocations: PaymentReceiptAllocationData[];
}

export interface PaymentReceiptDetailData {
  id: string;
  code: string;
  status: "posted" | "cancelled";
  receipt_type: "sale_payment" | "debt_collection" | "mixed_sale_and_debt";
  total_received_amount: number;
  created_at: string;
  customer: { id: string; code: string; name: string } | null;
  source_order: { id: string; code: string; total_amount: number } | null;
  methods: Array<{
    method_type: "cash" | "bank_transfer";
    amount: number;
    finance_account: { id: string; code: string; name: string };
  }>;
  allocations: PaymentReceiptAllocationData[];
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

export interface ProductionQueueItemData {
  id: string;
  production_machine: { id: string; code: string; name: string };
  raw_file_name: string;
  received_at: string;
  status: "queued" | "added_to_draft" | "dismissed";
  parse_status: "pending" | "ok" | "error";
  parse_error: string | null;
  parsed: Record<string, unknown>;
}

export interface ProductionQueueDraftPayloadData {
  queue_item_id: string;
  customer: { id: string; code: string; name: string } | null;
  draft_line: {
    product_id: string;
    product_code: string;
    product_name: string;
    unit_name: string;
    sell_method: SellMethod;
    width_m: number | null;
    height_m: number | null;
    linear_m: number | null;
    quantity: number;
    source: "production_queue";
  };
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
    latestPurchaseCost?: number | null;
    latestPurchaseCostUpdatedBy?: string;
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
  previewPriceFormula(input: {
    organizationId: string;
    formula: Record<string, unknown>;
  }): Promise<PriceFormulaPreviewData>;
  applyPriceFormula(input: {
    organizationId: string;
    actorUserId: string;
    formula: Record<string, unknown>;
    selectedItems: Array<{ product_id: string; price_list_id: string }>;
  }): Promise<{ formula_rule_id: string; affected_count: number }>;
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
  saveQuote(input: {
    organizationId: string;
    actorUserId: string;
    payload: Record<string, unknown>;
  }): Promise<QuoteSummaryData>;
  getQuoteReopenPayload(input: {
    organizationId: string;
    quoteId: string;
  }): Promise<QuoteReopenPayloadData | null>;
  reviseInvoice(input: {
    organizationId: string;
    actorUserId: string;
    orderId: string;
    payload: Record<string, unknown>;
  }): Promise<Record<string, unknown>>;
  listSalesDocuments(input: {
    organizationId: string;
    search?: string;
    type?: "quote" | "invoice";
    status?: "active" | "converted" | "completed" | "cancelled";
    paymentStatus?: "not_applicable" | "unpaid" | "partial" | "paid";
    from?: string;
    to?: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: SalesDocumentListItemData[]; total: number }>;
  getSalesDocument(input: {
    organizationId: string;
    orderId: string;
  }): Promise<SalesDocumentDetailData | null>;
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
  listCashbookEntries(input: {
    organizationId: string;
    financeAccountId?: string;
    search?: string;
    direction?: "in" | "out";
    sourceType?: "payment_receipt_method" | "cashbook_voucher";
    isBusinessAccounted?: boolean;
    from?: string;
    to?: string;
    page: number;
    pageSize: number;
  }): Promise<CashbookListData>;
  getCashbookEntry(input: {
    organizationId: string;
    entryId: string;
  }): Promise<CashbookEntryDetailData | null>;
  getPaymentReceipt(input: {
    organizationId: string;
    receiptId: string;
  }): Promise<PaymentReceiptDetailData | null>;
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
  listProductionQueue(input: {
    organizationId: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: ProductionQueueItemData[]; total: number }>;
  listProductionQueueHistory(input: {
    organizationId: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: ProductionQueueItemData[]; total: number }>;
  addProductionQueueItemToDraft(input: {
    organizationId: string;
    actorUserId: string;
    queueItemId: string;
  }): Promise<ProductionQueueDraftPayloadData | null>;
  dismissProductionQueueItem(input: {
    organizationId: string;
    actorUserId: string;
    queueItemId: string;
  }): Promise<ProductionQueueItemData | null>;
  restoreProductionQueueItem(input: {
    organizationId: string;
    actorUserId: string;
    queueItemId: string;
  }): Promise<ProductionQueueItemData | null>;
}
