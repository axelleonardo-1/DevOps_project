import { describe, expect, it, vi } from 'vitest'

import { simulatePayment } from '../src/services/payments.service.js'
import { getProductById, updateProductStock } from '../src/services/products.service.js'

const env = {
  PRODUCTS_SERVICE_URL: 'http://products.test',
}

describe('products service client', () => {
  it('gets a product by id through fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ productId: 'prod-1', name: 'Wireless Mouse', stock: 10, price: 100 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const product = await getProductById(env, 'prod-1', fetchMock)

    expect(product.productId).toBe('prod-1')
    expect(fetchMock).toHaveBeenCalledWith('http://products.test/products/prod-1')
  })

  it('updates product stock through fetch', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ productId: 'prod-1', stock: 10, price: 100 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ productId: 'prod-1', stock: 5 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )

    const result = await updateProductStock(env, 'prod-1', 5, fetchMock)

    expect(result.success).toBe(true)
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://products.test/products/prod-1/stock', expect.objectContaining({ method: 'PUT' }))
  })
})

describe('payments service', () => {
  it('covers all payment status branches without waiting', async () => {
    expect((await simulatePayment(100, { delayMs: 0, randomFn: () => 0.5 })).status).toBe('PAID')
    expect((await simulatePayment(100, { delayMs: 0, randomFn: () => 0.35 })).status).toBe('CONFIRMED')
    expect((await simulatePayment(100, { delayMs: 0, randomFn: () => 0.2 })).status).toBe('PENDING')
    expect((await simulatePayment(100, { delayMs: 0, randomFn: () => 0.1 })).status).toBe('CANCELLED')
  })
})
