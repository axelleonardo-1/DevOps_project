const safeTrimmed = (value) => (typeof value === 'string' ? value.trim() : '')

const apiMode = safeTrimmed(import.meta.env.VITE_API_MODE) || 'proxy'
const gatewayUrl = safeTrimmed(import.meta.env.VITE_API_GATEWAY_URL)
const productsApiUrl = safeTrimmed(import.meta.env.VITE_PRODUCTS_API_URL)
const ordersApiUrl = safeTrimmed(import.meta.env.VITE_ORDERS_API_URL)

const localProductsDefault = 'http://localhost:3001'
const localOrdersDefault = 'http://localhost:3002'

export const appConfig = {
  apiMode,
  appEnv: safeTrimmed(import.meta.env.VITE_APP_ENV) || 'dev',
  appVersion: safeTrimmed(import.meta.env.VITE_APP_VERSION) || '0.0.0-local',
  productsBaseUrl:
    apiMode === 'proxy'
      ? ''
      : productsApiUrl || gatewayUrl || localProductsDefault,
  ordersBaseUrl:
    apiMode === 'proxy'
      ? ''
      : ordersApiUrl || gatewayUrl || localOrdersDefault,
}

export const isDevApp = appConfig.appEnv.toLowerCase() === 'dev'
