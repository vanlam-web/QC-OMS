import { ApiError, successResponse } from "../http.ts";
import { handleMe } from "./me.ts";
import { handleWorkstations } from "./workstations.ts";
import { handlePermissions } from "./permissions.ts";
import { handleUsers } from "./users.ts";
import { handleCatalog } from "./catalog.ts";
import type { AuthClient } from "../middleware/auth.ts";
import type { FoundationRepository } from "../contracts.ts";
import type { RateLimiter } from "../middleware/rate-limit.ts";

export interface RouterOptions {
  version: string;
  auth?: AuthClient;
  repository?: FoundationRepository;
  rateLimiter?: RateLimiter;
}

export interface RouterDependencies {
  auth: AuthClient;
  repository: FoundationRepository;
  rateLimiter?: RateLimiter;
}

export function routeRequest(
  request: Request,
  traceId: string,
  options: RouterOptions,
): Response | Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/api/v1/health") {
    return successResponse(
      {
        status: "ok",
        service: "qc-oms-api",
        version: options.version,
      },
      traceId,
    );
  }

  if (request.method === "GET" && url.pathname === "/api/v1/me") {
    if (options.auth === undefined || options.repository === undefined) {
      throw new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "An internal error occurred.",
      });
    }

    return handleMe(request, traceId, {
      auth: options.auth,
      repository: options.repository,
    });
  }

  if (url.pathname === "/api/v1/workstations" || url.pathname.startsWith("/api/v1/workstations/")) {
    if (options.auth === undefined || options.repository === undefined) {
      throw new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "An internal error occurred.",
      });
    }

    return handleWorkstations(request, traceId, {
      auth: options.auth,
      repository: options.repository,
    });
  }

  if (url.pathname === "/api/v1/permissions") {
    if (options.repository === undefined) {
      throw new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "An internal error occurred.",
      });
    }
    return handlePermissions(options.repository, traceId);
  }

  if (url.pathname === "/api/v1/users" || url.pathname.startsWith("/api/v1/users/")) {
    if (options.auth === undefined || options.repository === undefined) {
      throw new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "An internal error occurred.",
      });
    }
    return handleUsers(request, traceId, {
      auth: options.auth,
      repository: options.repository,
      rateLimiter: options.rateLimiter,
    });
  }

  if (
    url.pathname === "/api/v1/products" ||
    url.pathname.startsWith("/api/v1/products/") ||
    url.pathname === "/api/v1/price-lists" ||
    url.pathname.startsWith("/api/v1/price-lists/") ||
    url.pathname === "/api/v1/pricing/resolve"
  ) {
    if (options.auth === undefined || options.repository === undefined) {
      throw new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "An internal error occurred.",
      });
    }

    return handleCatalog(request, traceId, {
      auth: options.auth,
      repository: options.repository,
    });
  }

  throw new ApiError({
    status: 404,
    code: "RESOURCE_NOT_FOUND",
    message: "The requested resource was not found.",
  });
}
