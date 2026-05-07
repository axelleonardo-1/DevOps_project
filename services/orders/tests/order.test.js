import { describe, expect, it, vi } from 'vitest'

import { createApp } from '../src/app.js'
import * as productsService from '../src/services/products.service.js'
import { createFakeOrdersDb } from './helpers/fake-d1.js'

function createEnv() {
  return {
    APP_VERSION: 'test-version',
    ORDERS_STORAGE_DRIVER: 'd1',
    PRODUCTS_SERVICE_URL: 'http://products.test',
    PAYMENT_DELAY_MS: '0',
    DB: createFakeOrdersDb(),
  }
}

describe('orders worker routes', () => {
  it('returns service health', async () => {
    const app = createApp()
    const response = await app.request('/health', {}, createEnv())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toBeTruthy()
    expect(body.ok).toBe(true)
    expect(body.runtime).toBe('cloudflare-workers')
  })

  it('returns version from bindings', async () => {
    const app = createApp()
    const response = await app.request('/version', {}, createEnv())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.version).toBe('test-version')
  })

  it('lists orders', async () => {
    const app = createApp()
    const response = await app.request('/orders', {}, createEnv())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
  })

  it('returns an order by id', async () => {
    const app = createApp()
    const response = await app.request('/orders/ord-1', {}, createEnv())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.orderId).toBe('ord-1')
  })

  it('returns 404 for unknown order id', async () => {
    const app = createApp()
    const response = await app.request('/orders/missing', {}, createEnv())

    expect(response.status).toBe(404)
  })

  it('creates a paid order and updates stock', async () => {
    vi.spyOn(productsService, 'getProductById').mockResolvedValue({
      productId: 'prod-1',
      name: 'Mouse',
      price: 100,
      stock: 10,
    })
    const updateSpy = vi.spyOn(productsService, 'updateProductStock').mockResolvedValue({ success: true, data: { stock: 8 } })
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const app = createApp()
    const response = await app.request(
      '/orders',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-2',
          customerName: 'Alice',
          customerEmail: 'alice@example.com',
          items: [{ productId: 'prod-1', quantity: 2 }],
        }),
      },
      createEnv(),
    )

    const body = await response.json()
    expect(response.status).toBe(201)
    expect(body.status).toBe('PAID')
    expect(body.order.customerName).toBe('Alice')
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ DB: expect.any(Object) }), 'prod-1', 2)
  })

  it('returns 400 when stock is insufficient', async () => {
    vi.spyOn(productsService, 'getProductById').mockResolvedValue({
      productId: 'prod-1',
      name: 'Mouse',
      price: 100,
      stock: 1,
    })

    const app = createApp()
    const response = await app.request(
      '/orders',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-2',
          items: [{ productId: 'prod-1', quantity: 3 }],
        }),
      },
      createEnv(),
    )

    expect(response.status).toBe(400)
  })

  it('returns 404 when product does not exist', async () => {
    vi.spyOn(productsService, 'getProductById').mockResolvedValue(null)

    const app = createApp()
    const response = await app.request(
      '/orders',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-2',
          items: [{ productId: 'missing', quantity: 1 }],
        }),
      },
      createEnv(),
    )

    expect(response.status).toBe(404)
  })

  it('updates order status and updates stock when moved to paid', async () => {
    const updateSpy = vi.spyOn(productsService, 'updateProductStock').mockResolvedValue({ success: true, data: { stock: 9 } })

    const app = createApp()
    const response = await app.request(
      '/orders/ord-1/status',
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      },
      createEnv(),
    )

    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.status).toBe('CONFIRMED')
    expect(updateSpy).toHaveBeenCalled()
  })

  it('rejects invalid status values', async () => {
    const app = createApp()
    const response = await app.request(
      '/orders/ord-1/status',
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'WRONG' }),
      },
      createEnv(),
    )

    expect(response.status).toBe(400)
  })

  it('deletes an order', async () => {
    const app = createApp()
    const response = await app.request('/orders/ord-1', { method: 'DELETE' }, createEnv())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.message).toBe('Orden eliminada')
  })
})
