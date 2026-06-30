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
}
