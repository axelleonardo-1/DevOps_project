import { ValidationError } from './errors.js'

const validCurrencies = ['MXN', 'USD', 'EUR']
const validStatuses = ['PAID', 'CONFIRMED', 'PENDING', 'CANCELLED']

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function parseRequiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError('Validation Error', [{ field, message: `${field} is required` }])
  }
  return value.trim()
}

function parseOptionalString(value, field) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value !== 'string') {
    throw new ValidationError('Validation Error', [{ field, message: `${field} must be a string` }])
  }

  return value.trim()
}

function parseOptionalCurrency(value) {
  if (value === undefined) {
    return 'MXN'
  }

  if (typeof value !== 'string' || !validCurrencies.includes(value)) {
    throw new ValidationError('Validation Error', [{ field: 'currency', message: `currency must be one of: ${validCurrencies.join(', ')}` }])
  }

  return value
}

function parseQuantity(value, field) {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError('Validation Error', [{ field, message: `${field} must be a positive integer` }])
  }
  return parsed
}

export function validateCreateOrder(payload) {
  if (!isPlainObject(payload)) {
    throw new ValidationError('Validation Error', [{ field: 'body', message: 'request body must be a JSON object' }])
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new ValidationError('Validation Error', [{ field: 'items', message: 'La orden debe contener al menos un producto' }])
  }

  return {
    userId: parseRequiredString(payload.userId, 'userId'),
    customerName: parseOptionalString(payload.customerName, 'customerName'),
    customerEmail: parseOptionalString(payload.customerEmail, 'customerEmail'),
    currency: parseOptionalCurrency(payload.currency),
    items: payload.items.map((item, index) => {
      if (!isPlainObject(item)) {
        throw new ValidationError('Validation Error', [{ field: `items.${index}`, message: 'each item must be an object' }])
      }

      return {
        productId: parseRequiredString(item.productId, `items.${index}.productId`),
        quantity: parseQuantity(item.quantity, `items.${index}.quantity`),
      }
    }),
  }
}

export function validateUpdateOrderStatus(payload) {
  if (!isPlainObject(payload)) {
    throw new ValidationError('Validation Error', [{ field: 'body', message: 'request body must be a JSON object' }])
  }

  if (typeof payload.status !== 'string') {
    throw new ValidationError('Validation Error', [{ field: 'status', message: 'Missing required field: status' }])
  }

  if (!validStatuses.includes(payload.status)) {
    throw new ValidationError('Invalid status value', [{ field: 'status', message: `allowed values: ${validStatuses.join(', ')}` }])
  }

  return {
    status: payload.status,
  }
}
