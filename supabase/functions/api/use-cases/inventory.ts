import type {
  FoundationRepository,
  InventoryProductData,
  PermissionCode,
  ProductStatus,
  StockMovementData,
  StocktakeData,
} from "../contracts.ts";
import { ApiError } from "../http.ts";

export interface InventoryContext {
  actorUserId: string;
  organizationId: string;
  permissions: readonly PermissionCode[];
}

export async function listInventoryProducts(
  repository: FoundationRepository,
  context: InventoryContext,
  url: URL,
): Promise<{ items: InventoryProductData[]; page: number; page_size: number; total: number }> {
  requireAnyPermission(context, ["perm.create_order", "perm.manage_inventory"]);
  const { search, status, inventoryShape, page, pageSize } = parseInventoryProductList(url, context.permissions);
  const result = await repository.listInventoryProducts({
    organizationId: context.organizationId,
    search,
    status,
    inventoryShape,
    page,
    pageSize,
  });
  return { items: result.items, page, page_size: pageSize, total: result.total };
}

export async function getInventoryProduct(
  repository: FoundationRepository,
  context: InventoryContext,
  productId: string,
): Promise<InventoryProductData> {
  requireAnyPermission(context, ["perm.create_order", "perm.manage_inventory"]);
  const result = await repository.getInventoryProduct({ organizationId: context.organizationId, productId });
  if (result === null) throw notFound();
  return result;
}

export async function listStockMovements(
  repository: FoundationRepository,
  context: InventoryContext,
  url: URL,
): Promise<{ items: StockMovementData[]; page: number; page_size: number; total: number }> {
  requireAnyPermission(context, ["perm.create_order", "perm.manage_inventory"]);
  const { page, pageSize } = parsePage(url);
  const productId = url.searchParams.get("product_id")?.trim() || undefined;
  const orderId = url.searchParams.get("order_id")?.trim() || undefined;
  const result = await repository.listStockMovements({
    organizationId: context.organizationId,
    productId,
    orderId,
    page,
    pageSize,
  });
  return { items: result.items, page, page_size: pageSize, total: result.total };
}

export async function listStocktakes(
  repository: FoundationRepository,
  context: InventoryContext,
  url: URL,
): Promise<{ items: StocktakeData[]; page: number; page_size: number; total: number }> {
  requireAnyPermission(context, ["perm.manage_inventory"]);
  const { page, pageSize } = parsePage(url);
  const search = url.searchParams.get("search")?.trim() || undefined;
  const status = parseOptionalEnum(url.searchParams.get("status"), ["draft", "balanced", "cancelled"]);
  const createdFrom = url.searchParams.get("created_from")?.trim() || undefined;
  const createdTo = url.searchParams.get("created_to")?.trim() || undefined;
  const result = await repository.listStocktakes({
    organizationId: context.organizationId,
    search,
    status,
    createdFrom,
    createdTo,
    page,
    pageSize,
  });
  return { items: result.items, page, page_size: pageSize, total: result.total };
}

export async function adjustNormalProductStock(
  repository: FoundationRepository,
  context: InventoryContext,
  productId: string,
  body: unknown,
): Promise<StocktakeData> {
  requireAnyPermission(context, ["perm.manage_inventory"]);
  const { actualQty, reason } = parseStockAdjustment(body);
  try {
    return await repository.adjustNormalProductStock({
      organizationId: context.organizationId,
      actorUserId: context.actorUserId,
      productId,
      actualQty,
      reason,
    });
  } catch (cause) {
    throw mapRepositoryError(cause);
  }
}

function parseInventoryProductList(
  url: URL,
  permissions: readonly PermissionCode[],
): {
  search?: string;
  status: ProductStatus | "all";
  inventoryShape?: "normal" | "roll" | "sheet";
  page: number;
  pageSize: number;
} {
  const { page, pageSize } = parsePage(url);
  const search = url.searchParams.get("search")?.trim();
  const requestedStatus = url.searchParams.get("status") ?? "active";
  const inventoryShape = parseOptionalEnum(url.searchParams.get("inventory_shape"), ["normal", "roll", "sheet"]);
  if (requestedStatus !== "active" && requestedStatus !== "inactive" && requestedStatus !== "all") {
    throw validationError();
  }
  if (search !== undefined && search.length > 100) throw validationError();
  return {
    search: search || undefined,
    status: contextCanManageInventory(permissions) ? requestedStatus : "active",
    inventoryShape,
    page,
    pageSize,
  };
}

function parseStockAdjustment(body: unknown): { actualQty: number; reason: string } {
  if (!isRecord(body)) throw validationError();
  if (typeof body.actual_qty !== "number" || !Number.isFinite(body.actual_qty) || body.actual_qty < 0) {
    throw validationError();
  }
  if (typeof body.reason !== "string" || body.reason.trim().length === 0) throw validationError();
  return { actualQty: body.actual_qty, reason: body.reason.trim() };
}

function parsePage(url: URL): { page: number; pageSize: number } {
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("page_size") ?? "20");
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw validationError();
  }
  return { page, pageSize };
}

function parseOptionalEnum<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  if (value === null || value === "") return undefined;
  if ((allowed as readonly string[]).includes(value)) return value as T;
  throw validationError();
}

function contextCanManageInventory(permissions: readonly PermissionCode[]): boolean {
  return permissions.includes("perm.manage_inventory");
}

function requireAnyPermission(context: InventoryContext, allowed: PermissionCode[]): void {
  if (!allowed.some((permission) => context.permissions.includes(permission))) {
    throw new ApiError({ status: 403, code: "PERMISSION_DENIED", message: "Permission denied." });
  }
}

function validationError(): ApiError {
  return new ApiError({ status: 400, code: "VALIDATION_ERROR", message: "Invalid request." });
}

function notFound(): ApiError {
  return new ApiError({ status: 404, code: "RESOURCE_NOT_FOUND", message: "The requested resource was not found." });
}

function mapRepositoryError(cause: unknown): ApiError {
  if (cause instanceof ApiError) return cause;
  if (isRecord(cause) && cause.code === "22023") return validationError();
  if (isRecord(cause) && cause.code === "23503") return notFound();
  return new ApiError({ status: 500, code: "INTERNAL_ERROR", message: "An internal error occurred." });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
