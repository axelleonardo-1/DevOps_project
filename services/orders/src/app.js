import { Hono } from 'hono'

import { AppError, toErrorResponse } from './lib/errors.js'
import { getRuntimeConfig } from './lib/runtime-config.js'
import { requestLogger } from './middlewares/request-logger.js'
import { ordersRouter } from './routes/orders.routes.js'

export function createApp() {
  const app = new Hono()

  app.use('*', requestLogger())

  app.get('/health', (c) => {
    const config = getRuntimeConfig(c.env)
    return c.json({
      ok: true,
      service: 'orders',
      runtime: 'cloudflare-workers',
      storageDriver: config.storageDriver,
      productsServiceUrlConfigured: Boolean(config.productsServiceUrl),
    })
  })

  app.get('/version', (c) => {
    const config = getRuntimeConfig(c.env)
    return c.json({
      service: 'orders',
      version: config.appVersion,
    })
  })

  app.route('/orders', ordersRouter)

  app.notFound((c) => {
    return c.json(toErrorResponse(new AppError(404, 'Not Found', 'NOT_FOUND'), c.get('requestId')), 404)
  })

  app.onError((error, c) => {
    const requestId = c.get('requestId')

    console.error('orders-service-error', {
      requestId,
      message: error?.message,
      stack: error?.stack,
      path: c.req.path,
      method: c.req.method,
    })

    if (error instanceof AppError) {
      return c.json(toErrorResponse(error, requestId), error.status)
    }

    const fallback = new AppError(500, 'Internal Server Error', 'INTERNAL_ERROR')
    return c.json(toErrorResponse(fallback, requestId), 500)
  })

  return app
}
