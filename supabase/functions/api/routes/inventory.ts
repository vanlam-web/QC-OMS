import type { FoundationRepository } from "../contracts.ts";
import { ApiError, successResponse } from "../http.ts";
import type { AuthClient } from "../middleware/auth.ts";
import { requireAuth } from "../middleware/auth.ts";
import {
  adjustNormalProductStock,
  createMaterialOpening,
  getMaterialOpeningOptions,
  getInventoryProduct,
  listInventoryProducts,
  listStockMovements,
  listStocktakes,
  previewPosMaterialShortage,
} from "../use-cases/inventory.ts";

export interface InventoryRouteDependencies {
  auth: AuthClient;
  repository: FoundationRepository;
}

export async function handleInventory(
  request: Request,
  traceId: string,
  dependencies: InventoryRouteDependencies,
): Promise<Response> {
  const authUser = await requireAuth(request, dependencies.auth);
  const currentUser = await dependencies.repository.getCurrentUser({
    userId: authUser.id,
    email: authUser.email,
    workstationId: request.headers.get("x-workstation-id"),
  });
  if (currentUser === null) {
    throw new ApiError({ status: 403, code: "ACCOUNT_INACTIVE", message: "Account is inactive." });
  }
  if (currentUser.workstationInvalid) {
    throw new ApiError({ status: 403, code: "WORKSTATION_INVALID", message: "Workstation is invalid." });
  }

  const context = {
    actorUserId: currentUser.user.id,
    organizationId: currentUser.organization.id,
    permissions: currentUser.permissions,
  };
  const url = new URL(request.url);

  if (url.pathname === "/api/v1/inventory/products" && request.method === "GET") {
    return successResponse(await listInventoryProducts(dependencies.repository, context, url), traceId);
  }

  if (url.pathname === "/api/v1/inventory/stock-movements" && request.method === "GET") {
    return successResponse(await listStockMovements(dependencies.repository, context, url), traceId);
  }

  if (url.pathname === "/api/v1/inventory/stocktakes" && request.method === "GET") {
    return successResponse(await listStocktakes(dependencies.repository, context, url), traceId);
  }

  if (url.pathname === "/api/v1/inventory/material-openings/options" && request.method === "GET") {
    return successResponse(await getMaterialOpeningOptions(dependencies.repository, context, url), traceId);
  }

  if (url.pathname === "/api/v1/inventory/material-openings" && request.method === "POST") {
    return successResponse(
      await createMaterialOpening(dependencies.repository, context, await request.json()),
      traceId,
      { status: 201 },
    );
  }

  if (url.pathname === "/api/v1/inventory/pos-shortage-preview" && request.method === "POST") {
    return successResponse(
      await previewPosMaterialShortage(dependencies.repository, context, await request.json()),
      traceId,
    );
  }

  const adjustMatch = url.pathname.match(/^\/api\/v1\/inventory\/products\/([^/]+)\/adjust-stock$/);
  if (adjustMatch !== null && request.method === "POST") {
    return successResponse(
      await adjustNormalProductStock(dependencies.repository, context, adjustMatch[1], await request.json()),
      traceId,
      { status: 201 },
    );
  }

  const productMatch = url.pathname.match(/^\/api\/v1\/inventory\/products\/([^/]+)$/);
  if (productMatch !== null && request.method === "GET") {
    return successResponse(await getInventoryProduct(dependencies.repository, context, productMatch[1]), traceId);
  }

  throw new ApiError({
    status: 404,
    code: "RESOURCE_NOT_FOUND",
    message: "The requested resource was not found.",
  });
}
