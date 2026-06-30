import type {
  FoundationRepository,
  PermissionCode,
  PriceListData,
  ProductData,
  ProductStatus,
  ResolvedPriceData,
  SellMethod,
} from "../contracts.ts";
import { ApiError } from "../http.ts";

export interface CatalogContext {
  organizationId: string;
  permissions: readonly PermissionCode[];
}

export interface ProductListResponse {
  items: ProductData[];
  page: number;
  page_size: number;
  total: number;
}

export interface PriceListResponse {
  items: PriceListData[];
}

export interface ResolvePricesResponse {
  items: ResolvedPriceData[];
}

const sellMethods = new Set<SellMethod>(["quantity", "area_m2", "linear_m", "sheet", "combo"]);

export function requireAnyPermission(context: CatalogContext, allowed: PermissionCode[]): void {
  if (!allowed.some((permission) => context.permissions.includes(permission))) {
    throw new ApiError({
      status: 403,
      code: "PERMISSION_DENIED",
      message: "Permission denied.",
    });
  }
}

export async function listProducts(
  repository: FoundationRepository,
  context: CatalogContext,
  url: URL,
): Promise<ProductListResponse> {
  requireAnyPermission(context, ["perm.create_order", "perm.edit_price_book"]);
  const { search, status, page, pageSize } = parseListProducts(url, context.permissions);
  const result = await repository.listProducts({
    organizationId: context.organizationId,
    search,
    status,
    page,
    pageSize,
  });
  return { items: result.items, page, page_size: pageSize, total: result.total };
}

export async function createProduct(
  repository: FoundationRepository,
  context: CatalogContext,
  body: unknown,
): Promise<ProductData> {
  requireAnyPermission(context, ["perm.edit_price_book"]);
  const input = parseProductCreate(body);

  try {
    return await repository.createProduct({ organizationId: context.organizationId, ...input });
  } catch (cause) {
    throw mapRepositoryError(cause);
  }
}

export async function updateProduct(
  repository: FoundationRepository,
  context: CatalogContext,
  id: string,
  body: unknown,
): Promise<ProductData> {
  requireAnyPermission(context, ["perm.edit_price_book"]);
  const input = parseProductUpdate(body);

  try {
    const row = await repository.updateProduct({ organizationId: context.organizationId, id, ...input });
    if (row === null) throw notFound();
    return row;
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw mapRepositoryError(cause);
  }
}

export async function listPriceLists(
  repository: FoundationRepository,
  context: CatalogContext,
  url: URL,
): Promise<PriceListResponse> {
  requireAnyPermission(context, ["perm.edit_price_book"]);
  const activeOnly = url.searchParams.get("active_only") !== "false";
  return { items: await repository.listPriceLists({ organizationId: context.organizationId, activeOnly }) };
}

export async function createPriceList(
  repository: FoundationRepository,
  context: CatalogContext,
  body: unknown,
): Promise<PriceListData> {
  requireAnyPermission(context, ["perm.edit_price_book"]);
  const input = parsePriceListCreate(body);

  try {
    return await repository.createPriceList({ organizationId: context.organizationId, ...input });
  } catch (cause) {
    throw mapRepositoryError(cause);
  }
}

export async function updatePriceList(
  repository: FoundationRepository,
  context: CatalogContext,
  id: string,
  body: unknown,
): Promise<PriceListData> {
  requireAnyPermission(context, ["perm.edit_price_book"]);
  const input = parsePriceListUpdate(body);

  try {
    const row = await repository.updatePriceList({ organizationId: context.organizationId, id, ...input });
    if (row === null) throw notFound();
    return row;
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw mapRepositoryError(cause);
  }
}

export async function upsertPriceListItem(
  repository: FoundationRepository,
  context: CatalogContext,
  priceListId: string,
  productId: string,
  body: unknown,
): Promise<ResolvedPriceData> {
  requireAnyPermission(context, ["perm.edit_price_book"]);
  const unitPrice = parseUnitPrice(body);

  try {
    return await repository.upsertPriceListItem({
      organizationId: context.organizationId,
      priceListId,
      productId,
      unitPrice,
    });
  } catch (cause) {
    throw mapRepositoryError(cause);
  }
}

export async function deletePriceListItem(
  repository: FoundationRepository,
  context: CatalogContext,
  priceListId: string,
  productId: string,
): Promise<{ deleted: boolean }> {
  requireAnyPermission(context, ["perm.edit_price_book"]);
  return {
    deleted: await repository.deletePriceListItem({
      organizationId: context.organizationId,
      priceListId,
      productId,
    }),
  };
}

export async function resolvePrices(
  repository: FoundationRepository,
  context: CatalogContext,
  body: unknown,
): Promise<ResolvePricesResponse> {
  requireAnyPermission(context, ["perm.create_order"]);
  const productIds = parseResolvePrices(body);
  try {
    return { items: await repository.resolvePrices({ organizationId: context.organizationId, productIds }) };
  } catch (cause) {
    throw mapRepositoryError(cause);
  }
}

function parseListProducts(
  url: URL,
  permissions: readonly PermissionCode[],
): { search?: string; status: ProductStatus | "all"; page: number; pageSize: number } {
  const search = url.searchParams.get("search")?.trim();
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("page_size") ?? "20");
  const requestedStatus = url.searchParams.get("status") ?? "active";
  const canEditPriceBook = permissions.includes("perm.edit_price_book");

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw validationError();
  }
  if (search !== undefined && search.length > 100) {
    throw validationError();
  }
  if (requestedStatus !== "active" && requestedStatus !== "inactive" && requestedStatus !== "all") {
    throw validationError();
  }

  return {
    search: search || undefined,
    status: canEditPriceBook ? requestedStatus : "active",
    page,
    pageSize,
  };
}

function parseProductCreate(body: unknown): {
  code: string;
  name: string;
  status: ProductStatus;
  unitName: string;
  sellMethod: SellMethod;
} {
  if (!isRecord(body)) throw validationError();
  return {
    code: normalizeCode(body.code),
    name: normalizeText(body.name, 200),
    status: parseStatus(body.status ?? "active"),
    unitName: normalizeText(body.unit_name, 30),
    sellMethod: parseSellMethod(body.sell_method),
  };
}

function parseProductUpdate(body: unknown): {
  code?: string;
  name?: string;
  status?: ProductStatus;
  unitName?: string;
  sellMethod?: SellMethod;
} {
  if (!isRecord(body)) throw validationError();
  const input: {
    code?: string;
    name?: string;
    status?: ProductStatus;
    unitName?: string;
    sellMethod?: SellMethod;
  } = {};
  if ("code" in body) input.code = normalizeCode(body.code);
  if ("name" in body) input.name = normalizeText(body.name, 200);
  if ("status" in body) input.status = parseStatus(body.status);
  if ("unit_name" in body) input.unitName = normalizeText(body.unit_name, 30);
  if ("sell_method" in body) input.sellMethod = parseSellMethod(body.sell_method);
  if (Object.keys(input).length === 0) throw validationError();
  return input;
}

function parsePriceListCreate(body: unknown): { code: string; name: string; isDefault: boolean } {
  if (!isRecord(body)) throw validationError();
  return {
    code: normalizeCode(body.code),
    name: normalizeText(body.name, 120),
    isDefault: parseBoolean(body.is_default ?? false),
  };
}

function parsePriceListUpdate(body: unknown): {
  code?: string;
  name?: string;
  isDefault?: boolean;
  isActive?: boolean;
} {
  if (!isRecord(body)) throw validationError();
  const input: { code?: string; name?: string; isDefault?: boolean; isActive?: boolean } = {};
  if ("code" in body) input.code = normalizeCode(body.code);
  if ("name" in body) input.name = normalizeText(body.name, 120);
  if ("is_default" in body) input.isDefault = parseBoolean(body.is_default);
  if ("is_active" in body) input.isActive = parseBoolean(body.is_active);
  if (Object.keys(input).length === 0) throw validationError();
  return input;
}

function parseUnitPrice(body: unknown): number {
  if (!isRecord(body)) throw validationError();
  const value = body.unit_price;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) throw validationError();
  return value;
}

function parseResolvePrices(body: unknown): string[] {
  if (!isRecord(body) || !Array.isArray(body.product_ids)) throw validationError();
  const productIds = [...new Set(body.product_ids)];
  if (
    productIds.length < 1 ||
    productIds.length > 100 ||
    !productIds.every((id) => typeof id === "string" && id.trim().length > 0)
  ) {
    throw validationError();
  }
  return productIds.map((id) => id.trim());
}

function normalizeCode(value: unknown): string {
  if (typeof value !== "string") throw validationError();
  const code = value.trim().toUpperCase();
  if (code.length < 1 || code.length > 50) throw validationError();
  return code;
}

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") throw validationError();
  const text = value.trim();
  if (text.length < 1 || text.length > maxLength) throw validationError();
  return text;
}

function parseStatus(value: unknown): ProductStatus {
  if (value !== "active" && value !== "inactive") throw validationError();
  return value;
}

function parseSellMethod(value: unknown): SellMethod {
  if (typeof value !== "string" || !sellMethods.has(value as SellMethod)) throw validationError();
  return value as SellMethod;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value !== "boolean") throw validationError();
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validationError(): ApiError {
  return new ApiError({ status: 400, code: "VALIDATION_ERROR", message: "Invalid request." });
}

function notFound(): ApiError {
  return new ApiError({
    status: 404,
    code: "RESOURCE_NOT_FOUND",
    message: "The requested resource was not found.",
  });
}

function mapRepositoryError(cause: unknown): ApiError {
  if (isRecord(cause) && cause.code === "23505") {
    return new ApiError({ status: 409, code: "RESOURCE_CONFLICT", message: "Resource conflict." });
  }
  if (isRecord(cause) && cause.code === "23503") {
    return notFound();
  }
  if (isRecord(cause) && cause.message === "PRODUCT_NOT_FOUND") {
    return notFound();
  }
  if (isRecord(cause) && cause.message === "DEFAULT_PRICE_LIST_REQUIRED") {
    return new ApiError({ status: 409, code: "RESOURCE_CONFLICT", message: "Default price list is required." });
  }
  return new ApiError({ status: 500, code: "INTERNAL_ERROR", message: "An internal error occurred." });
}
