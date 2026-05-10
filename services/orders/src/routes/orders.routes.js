import { Hono } from 'hono'

import { AppError } from '../lib/errors.js'
import { readJsonBody } from '../lib/json-body.js'
import { getRuntimeConfig } from '../lib/runtime-config.js'
import { validateCreateOrder, validateUpdateOrderStatus } from '../lib/validation.js'
import { createOrdersRepository } from '../repositories/orders.repository.js'
import { simulatePayment } from '../services/payments.service.js'
import { getProductById, updateProductStock } from '../services/products.service.js'

export const ordersRouter = new Hono()

ordersRouter.get('/', async (c) => {
  const repository = createOrdersRepository(c.env)
  const orders = await repository.list()

  return c.json(orders)
})

ordersRouter.get('/:id', async (c) => {
  const repository = createOrdersRepository(c.env)
  const order = await repository.getById(c.req.param('id'))

  if (!order) {
    throw new AppError(404, 'Orden no encontrada', 'ORDER_NOT_FOUND')
  }

  return c.json(order)
})

ordersRouter.post('/', async (c) => {
  const repository = createOrdersRepository(c.env)
  const payload = await readJsonBody(c)
  const input = validateCreateOrder(payload)
  const config = getRuntimeConfig(c.env)

  let total = 0
  const processedItems = []

  for (const item of input.items) {
    const product = await getProductById(c.env, item.productId)

    if (!product) {
      throw new AppError(404, `Producto con id ${item.productId} no encontrado`, 'PRODUCT_NOT_FOUND')
    }

    if (product.stock < item.quantity) {
      throw new AppError(400, `No hay suficiente stock del producto ${product.name}`, 'INSUFFICIENT_STOCK')
    }

    const itemTotal = product.price * item.quantity
    total += itemTotal

    processedItems.push({
      productId: product.productId,
      price: product.price,
      quantity: item.quantity,
      total: itemTotal,
    })
  }

  const paymentResponse = await simulatePayment(total, { delayMs: config.paymentDelayMs })

  const newOrder = {
    orderId: crypto.randomUUID(),
    userId: input.userId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    status: paymentResponse.status,
    items: processedItems,
    subtotal: total,
    total,
    currency: input.currency,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await repository.create(newOrder)

  if (['PAID', 'CONFIRMED'].includes(newOrder.status)) {
    for (const item of input.items) {
      await updateProductStock(c.env, item.productId, item.quantity)
    }
  }

  return c.json(
    {
      message: 'Proceso de orden finalizado',
      status: newOrder.status,
      order: newOrder,
    },
    201,
  )
})

ordersRouter.put('/:id/status', async (c) => {
  const repository = createOrdersRepository(c.env)
  const payload = await readJsonBody(c)
  const { status } = validateUpdateOrderStatus(payload)
  const updatedOrder = await repository.updateStatus(c.req.param('id'), status)

  if (['PAID', 'CONFIRMED'].includes(updatedOrder.status)) {
    for (const item of updatedOrder.items) {
      await updateProductStock(c.env, item.productId, item.quantity)
    }
  }

  return c.json(updatedOrder)
})

ordersRouter.delete('/:id', async (c) => {
  const repository = createOrdersRepository(c.env)
  const deletedOrder = await repository.delete(c.req.param('id'))

  return c.json({
    message: 'Orden eliminada',
    deletedOrder,
  })
})
