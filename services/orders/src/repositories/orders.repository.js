import { AppError, NotFoundError } from '../lib/errors.js'

function requireDb(env) {
  if (!env?.DB) {
    throw new AppError(500, 'D1 binding DB is not configured', 'MISSING_DB_BINDING')
  }

  return env.DB
}

function mapOrderItemRow(row) {
  return {
    productId: row.productId,
    price: Number(row.unitPrice),
    quantity: Number(row.quantity),
    total: Number(row.subtotal),
  }
}

function mapOrderRow(row) {
  if (!row) {
    return null
  }

  return {
    orderId: row.orderId,
    userId: row.userId,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    status: row.status,
    subtotal: Number(row.subtotal ?? row.total),
    total: Number(row.total),
    currency: row.currency,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

class D1OrdersRepository {
  constructor(db) {
    this.db = db
  }

  async list() {
    const result = await this.db
      .prepare(
        `
          SELECT
            orderId,
            userId,
            customerName,
            customerEmail,
            status,
            subtotal,
            total,
            currency,
            createdAt,
            updatedAt
          FROM orders
          ORDER BY datetime(createdAt) DESC, orderId ASC
        `,
      )
      .all()

    const orders = []
    for (const row of result.results || []) {
      orders.push(await this.#hydrateOrder(row))
    }

    return orders
  }

  async getById(orderId) {
    const row = await this.db
      .prepare(
        `
          SELECT
            orderId,
            userId,
            customerName,
            customerEmail,
            status,
            subtotal,
            total,
            currency,
            createdAt,
            updatedAt
          FROM orders
          WHERE orderId = ?
          LIMIT 1
        `,
      )
      .bind(orderId)
      .first()

    if (!row) {
      return null
    }

    return this.#hydrateOrder(row)
  }

  async create(orderInput) {
    const orderStatement = this.db
      .prepare(
        `
          INSERT INTO orders (
            orderId,
            userId,
            customerName,
            customerEmail,
            status,
            subtotal,
            total,
            currency,
            createdAt,
            updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .bind(
        orderInput.orderId,
        orderInput.userId,
        orderInput.customerName,
        orderInput.customerEmail,
        orderInput.status,
        orderInput.subtotal,
        orderInput.total,
        orderInput.currency,
        orderInput.createdAt,
        orderInput.updatedAt,
      )

    const itemStatements = orderInput.items.map((item) =>
      this.db
        .prepare(
          `
            INSERT INTO order_items (
              orderId,
              productId,
              quantity,
              unitPrice,
              subtotal
            ) VALUES (?, ?, ?, ?, ?)
          `,
        )
        .bind(orderInput.orderId, item.productId, item.quantity, item.price, item.total),
    )

    await this.db.batch([orderStatement, ...itemStatements])

    return this.getById(orderInput.orderId)
  }

  async updateStatus(orderId, status) {
    const existing = await this.getById(orderId)

    if (!existing || existing.status === status) {
      throw new AppError(404, 'Orden no encontrada o sin cambios', 'ORDER_NOT_FOUND_OR_UNCHANGED')
    }

    await this.db
      .prepare(
        `
          UPDATE orders
          SET status = ?, updatedAt = ?
          WHERE orderId = ?
        `,
      )
      .bind(status, new Date().toISOString(), orderId)
      .run()

    return this.getById(orderId)
  }

  async delete(orderId) {
    const existing = await this.getById(orderId)

    if (!existing) {
      throw new NotFoundError('Orden no encontrada')
    }

    await this.db.prepare('DELETE FROM orders WHERE orderId = ?').bind(orderId).run()

    return existing
  }

  async #hydrateOrder(row) {
    const order = mapOrderRow(row)
    const itemsResult = await this.db
      .prepare(
        `
          SELECT
            id,
            orderId,
            productId,
            quantity,
            unitPrice,
            subtotal
          FROM order_items
          WHERE orderId = ?
          ORDER BY id ASC
        `,
      )
      .bind(order.orderId)
      .all()

    return {
      ...order,
      items: (itemsResult.results || []).map(mapOrderItemRow),
    }
  }
}

export function createOrdersRepository(env = {}) {
  return new D1OrdersRepository(requireDb(env))
}
