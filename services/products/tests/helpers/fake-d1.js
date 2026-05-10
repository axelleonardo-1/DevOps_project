function clone(value) {
  return structuredClone(value)
}

function createSeedProducts() {
  return [
    {
      productId: 'prod-1',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      category: 'ACCESSORIES',
      price: 399.99,
      currency: 'MXN',
      stock: 50,
      isActive: 1,
      imageKey: null,
      imageUrl: null,
      createdAt: '2026-03-05T18:30:00.000Z',
      updatedAt: '2026-03-05T18:30:00.000Z',
    },
    {
      productId: 'prod-2',
      name: 'Mechanical Keyboard',
      description: 'Compact mechanical keyboard',
      category: 'ACCESSORIES',
      price: 1299,
      currency: 'MXN',
      stock: 20,
      isActive: 1,
      imageKey: null,
      imageUrl: null,
      createdAt: '2026-03-05T18:35:00.000Z',
      updatedAt: '2026-03-05T18:35:00.000Z',
    },
  ]
}

export function createFakeProductsDb() {
  const state = {
    products: createSeedProducts(),
  }

  function findProduct(productId) {
    return state.products.find((product) => product.productId === productId) || null
  }

  function applyProductFilters(bindings) {
    const [category, minPrice, maxPrice, isActive] = bindings

    return state.products.filter((product) => {
      if (category !== null && product.category !== category) return false
      if (minPrice !== null && Number(product.price) < Number(minPrice)) return false
      if (maxPrice !== null && Number(product.price) > Number(maxPrice)) return false
      if (isActive !== null && Number(product.isActive) !== Number(isActive)) return false
      return true
    })
  }

  return {
    prepare(query) {
      const normalized = query.replace(/\s+/g, ' ').trim()
      const statement = {
        bindings: [],
        bind(...bindings) {
          this.bindings = bindings
          return this
        },
        async first() {
          if (normalized.startsWith('SELECT COUNT(*) AS count FROM products')) {
            return { count: state.products.length }
          }

          if (normalized.includes('FROM products WHERE productId = ?')) {
            return clone(findProduct(this.bindings[0]))
          }

          return null
        },
        async all() {
          if (normalized.includes('FROM products WHERE (?1 IS NULL OR category = ?1)')) {
            return { results: applyProductFilters(this.bindings).map(clone) }
          }

          return { results: [] }
        },
        async run() {
          if (normalized.startsWith('INSERT INTO products')) {
            const [
              productId,
              name,
              description,
              price,
              category,
              stock,
              imageKey,
              imageUrl,
              isActive,
              createdAt,
              updatedAt,
              currency,
            ] = this.bindings

            state.products.push({
              productId,
              name,
              description,
              price,
              category,
              stock,
              imageKey,
              imageUrl,
              isActive,
              createdAt,
              updatedAt,
              currency,
            })

            return { success: true }
          }

          if (normalized.startsWith('UPDATE products SET name = ?,')) {
            const product = findProduct(this.bindings[10])
            if (product) {
              ;[
                product.name,
                product.description,
                product.price,
                product.category,
                product.stock,
                product.imageKey,
                product.imageUrl,
                product.isActive,
                product.updatedAt,
                product.currency,
              ] = this.bindings.slice(0, 10)
            }

            return { success: true }
          }

          if (normalized.startsWith('UPDATE products SET stock = ?, updatedAt = ?')) {
            const product = findProduct(this.bindings[2])
            if (product) {
              product.stock = this.bindings[0]
              product.updatedAt = this.bindings[1]
            }

            return { success: true }
          }

          return { success: true }
        },
      }

      return statement
    },
  }
}
