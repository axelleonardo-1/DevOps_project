import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { AppError, toErrorResponse } from './lib/errors.js'
import { getRuntimeConfig } from './lib/runtime-config.js'
import { requestLogger } from './middlewares/request-logger.js'
import { productsRouter } from './routes/products.routes.js'

export function createApp() {
  const app = new Hono()

  app.use('*', cors())
  app.use('*', requestLogger())

  app.get('/health', (c) => {
    const config = getRuntimeConfig(c.env)
    return c.json({
      ok: true,
      service: 'products',
      runtime: 'cloudflare-workers',
      storageDriver: config.storageDriver,
    })
  })

  app.get('/health/db', (c) => {
    const config = getRuntimeConfig(c.env)
    if (!c.env.DB) {
      return c.json(
        {
          ok: false,
          db: 'missing-binding',
          storageDriver: config.storageDriver,
          message: 'D1 binding DB is not configured.',
        },
        500,
      )
    }

    return c.env.DB
      .prepare('SELECT COUNT(*) AS count FROM products')
      .first()
      .then((result) =>
        c.json({
          ok: true,
          db: 'connected',
          storageDriver: config.storageDriver,
          productsCount: Number(result?.count || 0),
        }),
      )
  })

  app.get('/version', (c) => {
    const config = getRuntimeConfig(c.env)
    return c.json({
      service: 'products',
      version: config.appVersion,
    })
  })

  // Removed intentionally in the Worker runtime:
  // - /api-docs depended on swagger-ui-express
  // - /coverage depended on serving local filesystem artifacts
  app.route('/products', productsRouter)

  app.notFound((c) => {
    return c.json(toErrorResponse(new AppError(404, 'Not Found', 'NOT_FOUND'), c.get('requestId')), 404)
  })

  app.onError((error, c) => {
    const requestId = c.get('requestId')

    console.error('products-service-error', {
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
