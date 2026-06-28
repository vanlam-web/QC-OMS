import { createApiClient } from './client'

it('sends bearer token, workstation id, and request id', async () => {
  const calls: [RequestInfo | URL, RequestInit | undefined][] = []
  const fetchSpy: typeof fetch = async (input, init) => {
    calls.push([input, init])
    return new Response(JSON.stringify({ success: true, data: { ok: true }, trace_id: 'trace' }), {
      status: 200,
    })
  }
  const client = createApiClient({
    baseUrl: 'https://api.test',
    getAccessToken: async () => 'token-123',
    getWorkstationId: () => 'ws-1',
    fetch: fetchSpy as typeof fetch,
  })

  await expect(client.request('/api/v1/me')).resolves.toEqual({ ok: true })
  const request = calls[0][1] as RequestInit
  const headers = request.headers as Headers
  expect(headers.get('authorization')).toBe('Bearer token-123')
  expect(headers.get('x-workstation-id')).toBe('ws-1')
  expect(headers.get('x-request-id')).toMatch(/[0-9a-f-]{36}/)
})

it('throws typed API errors preserving metadata', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.test',
    getAccessToken: async () => null,
    fetch: (async () =>
      new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid', fields: { email: ['bad'] } },
          trace_id: 'trace-err',
        }),
        { status: 400 },
      )) as typeof fetch,
  })

  await expect(client.request('/api/v1/users')).rejects.toMatchObject({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid',
    traceId: 'trace-err',
    fields: { email: ['bad'] },
  })
})
