import { ApiError } from './client'
import { formatApiError } from './error-message'

it('maps known API errors and falls back for unknown causes', () => {
  expect(formatApiError(new ApiError(400, 'VALIDATION_ERROR', 'Invalid', 'trace'), 'Fallback')).toBe(
    'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại thông tin nhập.',
  )
  expect(formatApiError(new Error('boom'), 'Fallback')).toBe('Fallback')
})
