import { AppError, ValidationError } from './errors.js'
import { getRuntimeConfig } from './runtime-config.js'

const allowedMimeTypes = new Set(['image/png', 'image/jpeg', 'image/webp'])

function requireBucket(env) {
  if (!env?.PRODUCT_IMAGES_BUCKET) {
    throw new AppError(500, 'R2 binding PRODUCT_IMAGES_BUCKET is not configured', 'MISSING_R2_BINDING')
  }

  return env.PRODUCT_IMAGES_BUCKET
}

export function buildProductImageUrl(requestUrl, productId) {
  return new URL(`/products/${productId}/image`, requestUrl).toString()
}

async function parseMultipartBody(c) {
  try {
    return await c.req.formData()
  } catch {
    throw new ValidationError('Validation Error', [{ field: 'body', message: 'multipart form data could not be parsed' }])
  }
}

function fileExtensionForMimeType(mimeType) {
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/webp') return 'webp'
  return 'bin'
}

export async function readProductMutationInput(c) {
  const contentType = c.req.header('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      const payload = await c.req.json()
      return { payload, file: null }
    } catch {
      throw new ValidationError('Validation Error', [{ field: 'body', message: 'request body must contain valid JSON' }])
    }
  }

  if (!contentType.includes('multipart/form-data')) {
    throw new AppError(415, 'Only application/json or multipart/form-data are supported', 'UNSUPPORTED_MEDIA_TYPE')
  }

  const form = await parseMultipartBody(c)
  const fileCandidate = form.get('image')
  const file = fileCandidate instanceof File && fileCandidate.size > 0 ? fileCandidate : null

  const payload = {}
  for (const [key, value] of form.entries()) {
    if (key === 'image') continue
    if (typeof value === 'string') {
      payload[key] = value
    }
  }

  return { payload, file }
}

export async function uploadProductImage(env, file, productId) {
  if (!file) {
    return null
  }

  if (!allowedMimeTypes.has(file.type)) {
    throw new ValidationError('Validation Error', [{ field: 'image', message: 'image must be image/png, image/jpeg, or image/webp' }])
  }

  const { maxProductImageBytes } = getRuntimeConfig(env)

  if (file.size > maxProductImageBytes) {
    throw new ValidationError('Validation Error', [
      { field: 'image', message: `image size must be less than or equal to ${maxProductImageBytes} bytes` },
    ])
  }

  const bucket = requireBucket(env)
  const extension = fileExtensionForMimeType(file.type)
  const imageKey = `products/${productId}/${crypto.randomUUID()}.${extension}`
  const body = await file.arrayBuffer()

  await bucket.put(imageKey, body, {
    httpMetadata: {
      contentType: file.type,
    },
  })

  return {
    imageKey,
    contentType: file.type,
  }
}

export async function deleteProductImage(env, imageKey) {
  if (!imageKey) {
    return
  }

  const bucket = requireBucket(env)
  await bucket.delete(imageKey)
}

export async function getProductImageObject(env, imageKey) {
  if (!imageKey) {
    return null
  }

  const bucket = requireBucket(env)
  return bucket.get(imageKey)
}
