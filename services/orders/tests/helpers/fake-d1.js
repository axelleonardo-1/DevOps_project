function clone(value) {
  return structuredClone(value)
}

function createSeedState() {
  return {
    orders: [
      {
        orderId: 'ord-1',
        userId: 'user-1',
        customerName: null,
        customerEmail: null,
        status: 'PAID',
        subtotal: 399.99,
        total: 399.99,
        currency: 'MXN',
        createdAt: '2026-03-05T19:00:00.000Z',
        updatedAt: '2026-03-05T19:00:00.000Z',
      },
    ],
    orderItems: [
      {
        id: 1,
        orderId: 'ord-1',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 399.99,
        subtotal: 399.99,
      },
    ],
    nextOrderItemId: 2,
  }
}

export function createFakeOrdersDb() {
  const state = createSeedState()

  function findOrder(orderId) {
    return state.orders.find((order) => order.orderId === orderId) || null
  }

  function findOrderItems(orderId) {
    return state.orderItems.filter((item) => item.orderId === orderId).sort((a, b) => a.id - b.id)
  }

  function createStatement(normalized) {
    return {
      bindings: [],
      bind(...bindings) {
        this.bindings = bindings
        return this
      },
      async first() {
        if (normalized.includes('FROM orders WHERE orderId = ? LIMIT 1')) {
          return clone(findOrder(this.bindings[0]))
        }

        return null
      },
      async all() {
        if (normalized.includes('FROM orders ORDER BY datetime(createdAt) DESC')) {
          return { results: state.orders.map(clone) }
        }

        if (normalized.includes('FROM order_items WHERE orderId = ? ORDER BY id ASC')) {
          return { results: findOrderItems(this.bindings[0]).map(clone) }
        }

        return { results: [] }
      },
      async run() {
        if (normalized.startsWith('INSERT INTO orders')) {
          const [orderId, userId, customerName, customerEmail, status, subtotal, total, currency, createdAt, updatedAt] = this.bindings
          state.orders.push({
            orderId,
            userId,
            customerName,
            customerEmail,
            status,
            subtotal,
            total,
            currency,
            createdAt,
            updatedAt,
          })
          return { success: true }
        }

        if (normalized.startsWith('INSERT INTO order_items')) {
          const [orderId, productId, quantity, unitPrice, subtotal] = this.bindings
          state.orderItems.push({
            id: state.nextOrderItemId++,
            orderId,
            productId,
            quantity,
            unitPrice,
            subtotal,
          })
          return { success: true }
        }

        if (normalized.startsWith('UPDATE orders SET status = ?, updatedAt = ?')) {
          const order = findOrder(this.bindings[2])
          if (order) {
            order.status = this.bindings[0]
            order.updatedAt = this.bindings[1]
          }
          return { success: true }
        }

        if (normalized.startsWith('DELETE FROM orders WHERE orderId = ?')) {
          const orderId = this.bindings[0]
          const orderIndex = state.orders.findIndex((order) => order.orderId === orderId)
          if (orderIndex >= 0) {
            state.orders.splice(orderIndex, 1)
            state.orderItems = state.orderItems.filter((item) => item.orderId !== orderId)
          }
          return { success: true }
        }

        return { success: true }
      },
    }
  }

  return {
    prepare(query) {
      return createStatement(query.replace(/\s+/g, ' ').trim())
    },
    async batch(statements) {
      const results = []
      for (const statement of statements) {
        results.push(await statement.run())
      }
      return results
    },
  }
}
