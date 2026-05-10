import { UnsupportedMediaTypeError, ValidationError } from './errors.js'

export async function readJsonBody(c) {
  const contentType = c.req.header('content-type') || ''

  if (!contentType.includes('application/json')) {
    throw new UnsupportedMediaTypeError('Only application/json is supported for this endpoint')
  }

  try {
    return await c.req.json()
  } catch {
    throw new ValidationError('Validation Error', [{ field: 'body', message: 'request body must contain valid JSON' }])
  }
}
