import { ValidationError } from './errors.js'

const allowedCurrencies = ['MXN', 'USD', 'EUR']

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function parseOptionalString(value, field, { min = 0, max = 1000 } = {}) {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new ValidationError('Validation Error', [{ field, message: `${field} must be a string` }])
  }

  const trimmed = value.trim()

  if (trimmed.length < min) {
    throw new ValidationError('Validation Error', [{ field, message: `${field} must be at least ${min} characters long` }])
  }

  if (trimmed.length > max) {
    throw new ValidationError('Validation Error', [{ field, message: `${field} must be at most ${max} characters long` }])
  }

  return trimmed
}

function parseRequiredString(value, field, { min = 1, max = 1000 } = {}) {
  const parsed = parseOptionalString(value, field, { min, max })
  if (parsed === undefined) {
    throw new ValidationError('Validation Error', [{ field, message: `${field} is required` }])
  }
  return parsed
}

function parseNumber(value, field, { integer = false, min = Number.NEGATIVE_INFINITY, required = false } = {}) {
  if (value === undefined) {
    if (required) {
      throw new ValidationError('Validation Error', [{ field, message: `${field} is required` }])
    }
    return undefined
  }

  const parsed = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(parsed)) {
    throw new ValidationError('Validation Error', [{ field, message: `${field} must be a valid number` }])
  }

  if (integer && !Number.isInteger(parsed)) {
    throw new ValidationError('Validation Error', [{ field, message: `${field} must be an integer` }])
  }

  if (parsed < min) {
    throw new ValidationError('Validation Error', [{ field, message: `${field} must be greater than or equal to ${min}` }])
  }

  return parsed
}

function parseBoolean(value, field, { required = false, defaultValue } = {}) {
  if (value === undefined) {
    if (required) {
      throw new ValidationError('Validation Error', [{ field, message: `${field} is required` }])
    }
    return defaultValue
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw new ValidationError('Validation Error', [{ field, message: `${field} must be a boolean` }])
}

function parseCurrency(value, { required = false, defaultValue = 'MXN' } = {}) {
  if (value === undefined) {
    if (required) {
      throw new ValidationError('Validation Error', [{ field: 'currency', message: 'currency is required' }])
    }
    return defaultValue
  }

  if (typeof value !== 'string' || !allowedCurrencies.includes(value)) {
    throw new ValidationError('Validation Error', [{ field: 'currency', message: `currency must be one of: ${allowedCurrencies.join(', ')}` }])
  }

  return value
}

function parseImageUrl(value) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    throw new ValidationError('Validation Error', [{ field: 'imageUrl', message: 'imageUrl must be a string or null' }])
  }

  return value.trim()
}

function parseImageKey(value) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    throw new ValidationError('Validation Error', [{ field: 'imageKey', message: 'imageKey must be a string or null' }])
  }

  return value.trim()
}

export function validateListFilters(query) {
  return {
    category: typeof query.category === 'string' ? query.category.trim() : undefined,
    minPrice: parseNumber(query.minPrice, 'minPrice'),
    maxPrice: parseNumber(query.maxPrice, 'maxPrice'),
    isActive: parseBoolean(query.isActive, 'isActive'),
  }
}

export function validateCreateProduct(payload) {
  if (!isPlainObject(payload)) {
    throw new ValidationError('Validation Error', [{ field: 'body', message: 'request body must be a JSON object' }])
  }

  return {
    name: parseRequiredString(payload.name, 'name', { min: 3, max: 100 }),
    description: parseOptionalString(payload.description ?? '', 'description', { max: 1000 }),
    category: parseRequiredString(payload.category, 'category', { min: 1, max: 100 }),
    price: parseNumber(payload.price, 'price', { min: 0, required: true }),
    currency: parseCurrency(payload.currency, { defaultValue: 'MXN' }),
    stock: parseNumber(payload.stock, 'stock', { min: 0, integer: true, required: true }),
    isActive: parseBoolean(payload.isActive, 'isActive', { defaultValue: true }),
    imageUrl: parseImageUrl(payload.imageUrl) ?? null,
    imageKey: parseImageKey(payload.imageKey) ?? null,
  }
}

export function validateUpdateProduct(payload) {
  if (!isPlainObject(payload)) {
    throw new ValidationError('Validation Error', [{ field: 'body', message: 'request body must be a JSON object' }])
  }

  const updates = {
    name: parseOptionalString(payload.name, 'name', { min: 3, max: 100 }),
    description: payload.description === '' ? '' : parseOptionalString(payload.description, 'description', { max: 1000 }),
    category: parseOptionalString(payload.category, 'category', { min: 1, max: 100 }),
    price: parseNumber(payload.price, 'price', { min: 0 }),
    currency: payload.currency === undefined ? undefined : parseCurrency(payload.currency),
    isActive: parseBoolean(payload.isActive, 'isActive'),
    imageUrl: parseImageUrl(payload.imageUrl),
    imageKey: parseImageKey(payload.imageKey),
  }

  const sanitized = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined))

  if (Object.keys(sanitized).length === 0) {
    throw new ValidationError('Validation Error', [{ field: 'body', message: 'at least one updatable field is required' }])
  }

  return sanitized
}

export function validateStockUpdate(payload) {
  if (!isPlainObject(payload)) {
    throw new ValidationError('Validation Error', [{ field: 'body', message: 'request body must be a JSON object' }])
  }

  return {
    stock: parseNumber(payload.stock, 'stock', { min: 0, integer: true, required: true }),
  }
}
