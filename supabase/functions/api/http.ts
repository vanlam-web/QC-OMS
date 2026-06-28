export type ErrorCode =
  | "AUTH_REQUIRED"
  | "ACCOUNT_INACTIVE"
  | "WORKSTATION_INVALID"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "RESOURCE_CONFLICT"
  | "RESOURCE_NOT_FOUND"
  | "INTERNAL_ERROR";

export interface ApiErrorInit {
  status: number;
  code: ErrorCode;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly safeMessage: string;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.safeMessage = init.message;
  }
}

export interface CorsOptions {
  origin: string | null;
  allowedOrigins: readonly string[];
}

export function createTraceId(request: Request): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function corsHeaders({ origin, allowedOrigins }: CorsOptions): HeadersInit {
  if (origin === null || !allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    "access-control-allow-origin": origin,
    "access-control-allow-headers": "authorization, content-type, x-request-id, x-workstation-id",
    "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

export function preflightResponse(request: Request, allowedOrigins: readonly string[]): Response {
  const headers = corsHeaders({
    origin: request.headers.get("origin"),
    allowedOrigins,
  });

  if (Object.keys(headers).length === 0) {
    return errorResponse(
      new ApiError({
        status: 403,
        code: "PERMISSION_DENIED",
        message: "Origin is not allowed.",
      }),
      createTraceId(request),
    );
  }

  return new Response(null, { status: 204, headers });
}

export function successResponse<T>(
  data: T,
  traceId: string,
  init: ResponseInit = {},
): Response {
  return jsonResponse(
    {
      success: true,
      data,
      trace_id: traceId,
    },
    init.status ?? 200,
    init.headers,
  );
}

export function errorResponse(
  error: ApiError,
  traceId: string,
  headers?: HeadersInit,
): Response {
  return jsonResponse(
    {
      success: false,
      error: {
        code: error.code,
        message: error.safeMessage,
      },
      trace_id: traceId,
    },
    error.status,
    headers,
  );
}

function jsonResponse(body: unknown, status: number, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  });
}
