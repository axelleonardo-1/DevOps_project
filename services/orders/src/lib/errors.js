export class AppError extends Error {
  constructor(status, message, code = 'APP_ERROR', details = undefined) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export class ValidationError extends AppError {
  constructor(message, details = []) {
    super(400, message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export function toErrorResponse(error, requestId) {
  const payload = {
    error: error.message,
    code: error.code,
    requestId,
  }

  if (error.details) {
    payload.details = error.details
  }

  return payload
}
