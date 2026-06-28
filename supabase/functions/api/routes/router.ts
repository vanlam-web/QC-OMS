import { ApiError, successResponse } from "../http.ts";

export interface RouterOptions {
  version: string;
}

export function routeRequest(
  request: Request,
  traceId: string,
  options: RouterOptions,
): Response {
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

  throw new ApiError({
    status: 404,
    code: "RESOURCE_NOT_FOUND",
    message: "The requested resource was not found.",
  });
}
