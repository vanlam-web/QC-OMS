export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'ACCOUNT_INACTIVE'
  | 'WORKSTATION_INVALID'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_ERROR'
  | 'RESOURCE_CONFLICT'
  | 'RESOURCE_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export interface SuccessEnvelope<T> {
  success: true
  data: T
  trace_id: string
}

export interface ErrorEnvelope {
  success: false
  error: {
    code: ApiErrorCode
    message: string
    fields?: Record<string, string[]>
  }
  trace_id: string
}

export type ApiEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope

export interface CurrentUserData {
  user: { id: string; email: string; display_name: string }
  organization: { id: string; code: string; name: string }
  workstation: { id: string; code: string; name: string } | null
  permissions: `perm.${string}`[]
}
