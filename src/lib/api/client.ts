import type { ApiErrorCode, ApiEnvelope } from './types'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly traceId: string,
    readonly fields?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiClientOptions {
  baseUrl: string
  getAccessToken: () => Promise<string | null>
  fetch?: typeof fetch
}

export function createApiClient(options: ApiClientOptions) {
  const fetcher = options.fetch ?? fetch

  return {
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const accessToken = await options.getAccessToken()
      const traceId = crypto.randomUUID()
      const headers = new Headers(init.headers)
      headers.set('x-request-id', traceId)
      headers.set('content-type', headers.get('content-type') ?? 'application/json')

      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`)
      }

      const response = await fetcher(`${options.baseUrl}${path}`, { ...init, headers })
      const body = (await response.json()) as ApiEnvelope<T>

      if (!body.success) {
        throw new ApiError(
          response.status,
          body.error.code,
          body.error.message,
          body.trace_id,
          body.error.fields,
        )
      }

      return body.data
    },
  }
}
