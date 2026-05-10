import { describe, expect, it } from 'vitest'

import { createApp } from '../src/app.js'
import { createFakeProductsDb } from './helpers/fake-d1.js'
import { createFakeR2Bucket } from './helpers/fake-r2.js'

function createEnv() {
  return {
    APP_VERSION: 'test-version',
    PRODUCTS_STORAGE_DRIVER: 'd1',
    MAX_PRODUCT_IMAGE_BYTES: '1024',
    DB: createFakeProductsDb(),
    PRODUCT_IMAGES_BUCKET: createFakeR2Bucket(),
  }
}

describe('products worker routes', () => {
  it('returns service health', async () => {
    const app = createApp()
    const response = await app.request('/health', {}, createEnv())

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toBeTruthy()

    const body = await response.json()
    expect(body.ok).toBe(true)
    expect(body.runtime).toBe('cloudflare-workers')
  })

  it('returns db health from D1 binding', async () => {
    const app = createApp()
    const response = await app.request('/health/db', {}, createEnv())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.db).toBe('connected')
    expect(body.productsCount).toBeGreaterThan(0)
  })

  it('returns version from bindings', async () => {
    const app = createApp()
    const response = await app.request('/version', {}, createEnv())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.version).toBe('test-version')
  })

  it('lists products and supports filters', async () => {
    const app = createApp()
    const response = await app.request('/products?category=ACCESSORIES&isActive=true', {}, createEnv())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
    expect(body.every((product) => product.category === 'ACCESSORIES')).toBe(true)
  })

  it('returns a product by id', async () => {
    const app = createApp()
    const response = await app.request('/products/prod-1', {}, createEnv())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.productId).toBe('prod-1')
  })

  it('returns 404 for unknown product id', async () => {
    const app = createApp()
    const response = await app.request('/products/unknown', {}, createEnv())

    expect(response.status).toBe(404)
  })

  it('creates a product from json only', async () => {
    const app = createApp()
    const response = await app.request(
      '/products',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'USB-C Hub',
          description: 'Slim hub',
          category: 'ACCESSORIES',
          price: 799,
          currency: 'MXN',
          stock: 12,
          isActive: true,
        }),
      },
      createEnv(),
    )

    const body = await response.json()
    expect(response.status).toBe(201)
    expect(body.productId).toBeTruthy()
    expect(body.imageUrl).toBeNull()
  })

  it('creates a product with a valid image upload', async () => {
    const app = createApp()
    const formData = new FormData()
    formData.set('name', 'Camera Bag')
    formData.set('description', 'Travel-ready bag')
    formData.set('category', 'ACCESSORIES')
    formData.set('price', '999')
    formData.set('currency', 'MXN')
    formData.set('stock', '4')
    formData.set('image', new File([new Uint8Array([137, 80, 78, 71])], 'bag.png', { type: 'image/png' }))

    const response = await app.request(
      'https://products.example.com/products',
      {
        method: 'POST',
        body: formData,
      },
      createEnv(),
    )

    const body = await response.json()
    expect(response.status).toBe(201)
    expect(body.imageKey).toContain('products/')
    expect(body.imageUrl).toBe(`https://products.example.com/products/${body.productId}/image`)
  })

  it('rejects invalid image types', async () => {
    const app = createApp()
    const formData = new FormData()
    formData.set('name', 'Camera Bag')
    formData.set('description', 'Travel-ready bag')
    formData.set('category', 'ACCESSORIES')
    formData.set('price', '999')
    formData.set('currency', 'MXN')
    formData.set('stock', '4')
    formData.set('image', new File(['gif89a'], 'bag.gif', { type: 'image/gif' }))

    const response = await app.request(
      '/products',
      {
        method: 'POST',
        body: formData,
      },
      createEnv(),
    )

    expect(response.status).toBe(400)
  })

  it('rejects images that exceed the max size', async () => {
    const app = createApp()
    const formData = new FormData()
    formData.set('name', 'Large Poster')
    formData.set('description', 'Too large')
    formData.set('category', 'ACCESSORIES')
    formData.set('price', '999')
    formData.set('currency', 'MXN')
    formData.set('stock', '4')
    formData.set('image', new File([new Uint8Array(2048)], 'large.webp', { type: 'image/webp' }))

    const response = await app.request(
      '/products',
      {
        method: 'POST',
        body: formData,
      },
      createEnv(),
    )

    expect(response.status).toBe(400)
  })

  it('updates a product', async () => {
    const app = createApp()
    const response = await app.request(
      '/products/prod-1',
      {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          price: 450,
          isActive: false,
        }),
      },
      createEnv(),
    )

    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.price).toBe(450)
    expect(body.isActive).toBe(false)
  })

  it('updates stock', async () => {
    const app = createApp()
    const response = await app.request(
      '/products/prod-2/stock',
      {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          stock: 7,
        }),
      },
      createEnv(),
    )

    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.stock).toBe(7)
  })

  it('serves a stored product image', async () => {
    const app = createApp()
    const env = createEnv()
    const formData = new FormData()
    formData.set('name', 'Camera Bag')
    formData.set('description', 'Travel-ready bag')
    formData.set('category', 'ACCESSORIES')
    formData.set('price', '999')
    formData.set('currency', 'MXN')
    formData.set('stock', '4')
    formData.set('image', new File([new Uint8Array([255, 216, 255])], 'bag.jpg', { type: 'image/jpeg' }))

    const createResponse = await app.request(
      'https://products.example.com/products',
      {
        method: 'POST',
        body: formData,
      },
      env,
    )
    const created = await createResponse.json()

    const imageResponse = await app.request(`/products/${created.productId}/image`, {}, env)

    expect(imageResponse.status).toBe(200)
    expect(imageResponse.headers.get('content-type')).toBe('image/jpeg')
  })
})
