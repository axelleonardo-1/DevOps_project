function parseNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function getRuntimeConfig(env = {}) {
  return {
    appVersion: env.APP_VERSION || '0.0.0-dev',
    storageDriver: env.ORDERS_STORAGE_DRIVER || 'd1',
    productsServiceUrl: env.PRODUCTS_SERVICE_URL || '',
    paymentDelayMs: Math.max(0, parseNumber(env.PAYMENT_DELAY_MS, 25)),
  }
}
