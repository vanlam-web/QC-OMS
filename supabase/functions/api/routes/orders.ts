import type { FoundationRepository } from "../contracts.ts";
import { ApiError, successResponse } from "../http.ts";
import type { AuthClient } from "../middleware/auth.ts";
import { requireAuth } from "../middleware/auth.ts";
import { checkoutOrder, reviseInvoice } from "../use-cases/orders.ts";

export interface OrderRouteDependencies {
  auth: AuthClient;
  repository: FoundationRepository;
}

export async function handleOrders(
  request: Request,
  traceId: string,
  dependencies: OrderRouteDependencies,
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

  if (url.pathname === "/api/v1/orders/checkout" && request.method === "POST") {
    return successResponse(
      await checkoutOrder(dependencies.repository, context, await request.json()),
      traceId,
      { status: 201 },
    );
  }

  const reviseMatch = url.pathname.match(/^\/api\/v1\/orders\/([^/]+)\/revise$/);
  if (reviseMatch !== null && request.method === "POST") {
    return successResponse(
      await reviseInvoice(dependencies.repository, context, reviseMatch[1], await request.json()),
      traceId,
    );
  }

  throw new ApiError({
    status: 404,
    code: "RESOURCE_NOT_FOUND",
    message: "The requested resource was not found.",
  });
}
