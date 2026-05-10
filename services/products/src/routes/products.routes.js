import { Hono } from 'hono'

import { NotFoundError } from '../lib/errors.js'
import { readJsonBody } from '../lib/json-body.js'
import { buildProductImageUrl, deleteProductImage, getProductImageObject, readProductMutationInput, uploadProductImage } from '../lib/product-images.js'
import { validateCreateProduct, validateListFilters, validateStockUpdate, validateUpdateProduct } from '../lib/validation.js'
import { createProductsRepository } from '../repositories/products.repository.js'

export const productsRouter = new Hono()

productsRouter.get('/', async (c) => {
  const repository = createProductsRepository(c.env)
  const filters = validateListFilters(c.req.query())
  const products = await repository.list(filters)

  return c.json(products)
})

productsRouter.get('/:id', async (c) => {
  const repository = createProductsRepository(c.env)
  const product = await repository.getById(c.req.param('id'))

  if (!product) {
    return c.json({ error: 'Product not found', code: 'NOT_FOUND', requestId: c.get('requestId') }, 404)
  }

  return c.json(product)
})

productsRouter.post('/', async (c) => {
  const repository = createProductsRepository(c.env)
  const { payload, file } = await readProductMutationInput(c)
  const productId = crypto.randomUUID()
  const productInput = validateCreateProduct(payload)
  const uploadedImage = await uploadProductImage(c.env, file, productId)
  const imageUrl = uploadedImage ? buildProductImageUrl(c.req.url, productId) : productInput.imageUrl
  const createdProduct = await repository.create({
    ...productInput,
    productId,
    imageKey: uploadedImage?.imageKey ?? productInput.imageKey ?? null,
    imageUrl: imageUrl ?? null,
  })

  return c.json(createdProduct, 201)
})

productsRouter.put('/:id', async (c) => {
  const repository = createProductsRepository(c.env)
  const productId = c.req.param('id')
  const existingProduct = await repository.getById(productId)

  if (!existingProduct) {
    throw new NotFoundError('Product not found')
  }

  const { payload, file } = await readProductMutationInput(c)
  const updates = Object.keys(payload).length === 0 && file ? {} : validateUpdateProduct(payload)
  let nextUpdates = updates

  if (file) {
    const uploadedImage = await uploadProductImage(c.env, file, productId)
    nextUpdates = {
      ...updates,
      imageKey: uploadedImage.imageKey,
      imageUrl: buildProductImageUrl(c.req.url, productId),
    }
  }

  const updatedProduct = await repository.update(productId, nextUpdates)

  if (file && existingProduct.imageKey && existingProduct.imageKey !== updatedProduct.imageKey) {
    await deleteProductImage(c.env, existingProduct.imageKey)
  }

  return c.json(updatedProduct)
})

productsRouter.put('/:id/stock', async (c) => {
  const repository = createProductsRepository(c.env)
  const payload = await readJsonBody(c)
  const stockUpdate = validateStockUpdate(payload)
  const updatedProduct = await repository.updateStock(c.req.param('id'), stockUpdate.stock)

  return c.json(updatedProduct)
})

productsRouter.get('/:id/image', async (c) => {
  const repository = createProductsRepository(c.env)
  const product = await repository.getById(c.req.param('id'))

  if (!product || !product.imageKey) {
    throw new NotFoundError('Product image not found')
  }

  const object = await getProductImageObject(c.env, product.imageKey)

  if (!object) {
    throw new NotFoundError('Product image not found')
  }

  const headers = new Headers()
  if (object.httpMetadata?.contentType) {
    headers.set('content-type', object.httpMetadata.contentType)
  }
  headers.set('cache-control', 'public, max-age=3600')
  headers.set('etag', object.httpEtag)

  return new Response(object.body, { headers })
})
