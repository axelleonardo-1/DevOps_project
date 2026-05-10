export function getRuntimeConfig(env = {}) {
  return {
    appVersion: env.APP_VERSION || '0.0.0-dev',
    storageDriver: env.PRODUCTS_STORAGE_DRIVER || 'd1',
    maxProductImageBytes: Number(env.MAX_PRODUCT_IMAGE_BYTES || 5 * 1024 * 1024),
  }
}
