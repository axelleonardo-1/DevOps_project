import { AppError, ValidationError } from './errors.js'

export async function readJsonBody(c) {
  const contentType = c.req.header('content-type') || ''

  if (!contentType.includes('application/json')) {
    throw new AppError(415, 'Only application/json is supported in this phase', 'UNSUPPORTED_MEDIA_TYPE')
  }

  try {
    return await c.req.json()
  } catch {
    throw new ValidationError('Validation Error', [{ field: 'body', message: 'request body must contain valid JSON' }])
  }
}
