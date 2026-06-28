import { ApiError, corsHeaders, createTraceId, errorResponse, preflightResponse } from "./http.ts";
import { routeRequest } from "./routes/router.ts";

export interface AppOptions {
  version: string;
  allowedOrigins?: readonly string[];
}

export type AppHandler = (request: Request) => Promise<Response>;

export function createApp(options: AppOptions): AppHandler {
  const allowedOrigins = options.allowedOrigins ?? [];

  return async (request: Request): Promise<Response> => {
    const traceId = createTraceId(request);
    const origin = request.headers.get("origin");
    const headers = corsHeaders({ origin, allowedOrigins });

    if (request.method === "OPTIONS") {
      return preflightResponse(request, allowedOrigins);
    }

    try {
      const response = await routeRequest(request, traceId, {
        version: options.version,
      });

      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }

      return response;
    } catch (cause) {
      const error = cause instanceof ApiError
        ? cause
        : new ApiError({
          status: 500,
          code: "INTERNAL_ERROR",
          message: "An internal error occurred.",
        });

      return errorResponse(error, traceId, headers);
    }
  };
}
