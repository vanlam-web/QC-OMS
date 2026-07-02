import type { FoundationRepository, PermissionCode, SupplierData } from "../contracts.ts";
import { ApiError } from "../http.ts";
import { requireAnyPermission } from "./catalog.ts";

export interface PurchaseContext {
  organizationId: string;
  permissions: readonly PermissionCode[];
}

export interface SupplierListResponse {
  items: SupplierData[];
  page: number;
  page_size: number;
  total: number;
}

export async function listSuppliers(
  repository: FoundationRepository,
  context: PurchaseContext,
  url: URL,
): Promise<SupplierListResponse> {
  requireAnyPermission(context, ["perm.manage_inventory"]);
  const { search, status, page, pageSize } = parseSupplierList(url);
  const result = await repository.listSuppliers({
    organizationId: context.organizationId,
    search,
    status,
    page,
    pageSize,
  });
  return { items: result.items, page, page_size: pageSize, total: result.total };
}

export async function getSupplier(
  repository: FoundationRepository,
  context: PurchaseContext,
  id: string,
): Promise<SupplierData> {
  requireAnyPermission(context, ["perm.manage_inventory"]);
  const row = await repository.getSupplier({ organizationId: context.organizationId, id });
  if (row === null) throw notFound();
  return row;
}

export async function createSupplier(
  repository: FoundationRepository,
  context: PurchaseContext,
  body: unknown,
): Promise<SupplierData> {
  requireAnyPermission(context, ["perm.manage_inventory"]);
  const input = parseSupplierCreate(body);
  try {
    return await repository.createSupplier({ organizationId: context.organizationId, ...input });
  } catch (cause) {
    throw mapRepositoryError(cause);
  }
}

export async function updateSupplier(
  repository: FoundationRepository,
  context: PurchaseContext,
  id: string,
  body: unknown,
): Promise<SupplierData> {
  requireAnyPermission(context, ["perm.manage_inventory"]);
  const input = parseSupplierUpdate(body);
  try {
    const row = await repository.updateSupplier({ organizationId: context.organizationId, id, ...input });
    if (row === null) throw notFound();
    return row;
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw mapRepositoryError(cause);
  }
}

function parseSupplierList(url: URL): {
  search?: string;
  status: "active" | "inactive" | "all";
  page: number;
  pageSize: number;
} {
  const search = url.searchParams.get("q")?.trim() || url.searchParams.get("search")?.trim();
  const status = parseSupplierListStatus(url.searchParams.get("status") ?? "active");
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("page_size") ?? "20");
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw validationError();
  }
  if (search !== undefined && search.length > 100) throw validationError();
  return { search: search || undefined, status, page, pageSize };
}

function parseSupplierCreate(body: unknown): {
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  linkedCustomerId?: string | null;
  notes?: string;
  status?: "active" | "inactive";
} {
  if (!isRecord(body)) throw validationError();
  const input: {
    code?: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    taxCode?: string;
    linkedCustomerId?: string | null;
    notes?: string;
    status?: "active" | "inactive";
  } = { name: normalizeText(body.name, 200) };
  if ("code" in body && body.code !== null && body.code !== undefined && String(body.code).trim() !== "") {
    input.code = normalizeCode(body.code);
  }
  if ("phone" in body && body.phone !== null && body.phone !== undefined && String(body.phone).trim() !== "") {
    input.phone = normalizeText(body.phone, 30);
  }
  if ("email" in body && body.email !== null && body.email !== undefined && String(body.email).trim() !== "") {
    input.email = normalizeText(body.email, 254);
  }
  if ("address" in body && body.address !== null && body.address !== undefined && String(body.address).trim() !== "") {
    input.address = normalizeText(body.address, 500);
  }
  if ("tax_code" in body && body.tax_code !== null && body.tax_code !== undefined && String(body.tax_code).trim() !== "") {
    input.taxCode = normalizeText(body.tax_code, 50);
  }
  if ("linked_customer_id" in body) input.linkedCustomerId = parseOptionalId(body.linked_customer_id);
  if ("notes" in body && body.notes !== null && body.notes !== undefined && String(body.notes).trim() !== "") {
    input.notes = normalizeText(body.notes, 1000);
  }
  if ("status" in body) input.status = parseSupplierStatus(body.status);
  return input;
}

function parseSupplierUpdate(body: unknown): {
  code?: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxCode?: string | null;
  linkedCustomerId?: string | null;
  notes?: string | null;
  status?: "active" | "inactive";
} {
  if (!isRecord(body)) throw validationError();
  const input: {
    code?: string;
    name?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    taxCode?: string | null;
    linkedCustomerId?: string | null;
    notes?: string | null;
    status?: "active" | "inactive";
  } = {};
  if ("code" in body) input.code = normalizeCode(body.code);
  if ("name" in body) input.name = normalizeText(body.name, 200);
  if ("phone" in body) input.phone = parseOptionalText(body.phone, 30);
  if ("email" in body) input.email = parseOptionalText(body.email, 254);
  if ("address" in body) input.address = parseOptionalText(body.address, 500);
  if ("tax_code" in body) input.taxCode = parseOptionalText(body.tax_code, 50);
  if ("linked_customer_id" in body) input.linkedCustomerId = parseOptionalId(body.linked_customer_id);
  if ("notes" in body) input.notes = parseOptionalText(body.notes, 1000);
  if ("status" in body) input.status = parseSupplierStatus(body.status);
  if (Object.keys(input).length === 0) throw validationError();
  return input;
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

function parseOptionalText(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  return normalizeText(value, maxLength);
}

function parseOptionalId(value: unknown): string | null {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  if (typeof value !== "string") throw validationError();
  return value.trim();
}

function parseSupplierStatus(value: unknown): "active" | "inactive" {
  if (value !== "active" && value !== "inactive") throw validationError();
  return value;
}

function parseSupplierListStatus(value: string): "active" | "inactive" | "all" {
  if (value !== "active" && value !== "inactive" && value !== "all") throw validationError();
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
    return validationError();
  }
  if (isRecord(cause) && cause.code === "23514") {
    return validationError();
  }
  return new ApiError({ status: 500, code: "INTERNAL_ERROR", message: "An internal error occurred." });
}
