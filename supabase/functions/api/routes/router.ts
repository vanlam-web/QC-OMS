import { ApiError, successResponse } from "../http.ts";
import { handleMe } from "./me.ts";
import type { AuthClient } from "../middleware/auth.ts";
import type { FoundationRepository } from "../contracts.ts";

export interface RouterOptions {
  version: string;
  auth?: AuthClient;
  repository?: FoundationRepository;
}

export interface RouterDependencies {
  auth: AuthClient;
  repository: FoundationRepository;
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

  throw new ApiError({
    status: 404,
    code: "RESOURCE_NOT_FOUND",
    message: "The requested resource was not found.",
  });
}
