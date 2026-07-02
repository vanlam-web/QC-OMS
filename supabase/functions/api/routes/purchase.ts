import type { FoundationRepository } from "../contracts.ts";
import { ApiError, successResponse } from "../http.ts";
import type { AuthClient } from "../middleware/auth.ts";
import { requireAuth } from "../middleware/auth.ts";
import { createSupplier, getSupplier, listSuppliers, updateSupplier } from "../use-cases/purchase.ts";

export interface PurchaseRouteDependencies {
  auth: AuthClient;
  repository: FoundationRepository;
}

export async function handlePurchase(
  request: Request,
  traceId: string,
  dependencies: PurchaseRouteDependencies,
): Promise<Response> {
  const authUser = await requireAuth(request, dependencies.auth);
  const currentUser = await dependencies.repository.getCurrentUser({
    userId: authUser.id,
    email: authUser.email,
    workstationId: null,
  });
  if (currentUser === null) {
    throw new ApiError({ status: 403, code: "ACCOUNT_INACTIVE", message: "Account is inactive." });
  }

  const context = {
    organizationId: currentUser.organization.id,
    permissions: currentUser.permissions,
  };
  const url = new URL(request.url);

  if (url.pathname === "/api/v1/suppliers") {
    if (request.method === "GET") {
      return successResponse(await listSuppliers(dependencies.repository, context, url), traceId);
    }
    if (request.method === "POST") {
      return successResponse(
        await createSupplier(dependencies.repository, context, await request.json()),
        traceId,
        { status: 201 },
      );
    }
    throw new ApiError({ status: 405, code: "METHOD_NOT_ALLOWED", message: "Method not allowed." });
  }

  const supplierMatch = url.pathname.match(/^\/api\/v1\/suppliers\/([^/]+)$/);
  if (supplierMatch !== null) {
    if (request.method === "GET") {
      return successResponse(await getSupplier(dependencies.repository, context, supplierMatch[1]), traceId);
    }
    if (request.method === "PATCH") {
      return successResponse(
        await updateSupplier(dependencies.repository, context, supplierMatch[1], await request.json()),
        traceId,
      );
    }
    throw new ApiError({ status: 405, code: "METHOD_NOT_ALLOWED", message: "Method not allowed." });
  }

  throw new ApiError({ status: 404, code: "RESOURCE_NOT_FOUND", message: "Route not found." });
}
