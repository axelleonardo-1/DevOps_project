import { AppError } from '../lib/errors.js'
import { getRuntimeConfig } from '../lib/runtime-config.js'

function getBaseUrl(env) {
  const { productsServiceUrl } = getRuntimeConfig(env)

  if (!productsServiceUrl) {
    throw new AppError(500, 'PRODUCTS_SERVICE_URL is not configured', 'MISSING_PRODUCTS_SERVICE_URL')
  }

  return productsServiceUrl.replace(/\/$/, '')
}

export async function getProductById(env, productId, fetchImpl = fetch) {
  const finalUrl = `${getBaseUrl(env)}/products/${productId}`

  const response = await fetchImpl(finalUrl)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new AppError(502, `Error en Products Service: ${response.statusText}`, 'PRODUCTS_SERVICE_ERROR')
  }

  return response.json()
}

export async function updateProductStock(env, productId, quantity, fetchImpl = fetch) {
  const product = await getProductById(env, productId, fetchImpl)

  if (!product) {
    return null
  }

  const finalUrl = `${getBaseUrl(env)}/products/${productId}/stock`
  const newStock = product.stock - quantity

  const response = await fetchImpl(finalUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stock: newStock }),
  })

  if (!response.ok) {
    throw new AppError(502, `Error al actualizar stock: ${response.statusText}`, 'PRODUCTS_STOCK_UPDATE_ERROR')
  }

  return {
    success: true,
    data: await response.json(),
  }
}
