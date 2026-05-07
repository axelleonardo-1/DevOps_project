import { AppError, NotFoundError } from '../lib/errors.js'

function requireDb(env) {
  if (!env?.DB) {
    throw new AppError(500, 'D1 binding DB is not configured', 'MISSING_DB_BINDING')
  }

  return env.DB
}

function mapProductRow(row) {
  if (!row) {
    return null
  }

  return {
    productId: row.productId,
    name: row.name,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    currency: row.currency,
    stock: Number(row.stock),
    isActive: Boolean(row.isActive),
    imageKey: row.imageKey,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

class D1ProductsRepository {
  constructor(db) {
    this.db = db
  }

  async list(filters = {}) {
    const result = await this.db
      .prepare(
        `
          SELECT
            productId,
            name,
            description,
            category,
            price,
            currency,
            stock,
            imageKey,
            imageUrl,
            isActive,
            createdAt,
            updatedAt
          FROM products
          WHERE (?1 IS NULL OR category = ?1)
            AND (?2 IS NULL OR price >= ?2)
            AND (?3 IS NULL OR price <= ?3)
            AND (?4 IS NULL OR isActive = ?4)
          ORDER BY datetime(createdAt) DESC, productId ASC
        `,
      )
      .bind(
        filters.category ?? null,
        filters.minPrice ?? null,
        filters.maxPrice ?? null,
        filters.isActive === undefined ? null : Number(filters.isActive),
      )
      .all()

    return (result.results || []).map(mapProductRow)
  }

  async getById(productId) {
    const row = await this.db
      .prepare(
        `
          SELECT
            productId,
            name,
            description,
            category,
            price,
            currency,
            stock,
            imageKey,
            imageUrl,
            isActive,
            createdAt,
            updatedAt
          FROM products
          WHERE productId = ?
          LIMIT 1
        `,
      )
      .bind(productId)
      .first()

    return mapProductRow(row)
  }

  async create(productInput) {
    const now = new Date().toISOString()
    const productId = productInput.productId || crypto.randomUUID()

    await this.db
      .prepare(
        `
          INSERT INTO products (
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
            currency
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .bind(
        productId,
        productInput.name,
        productInput.description,
        productInput.price,
        productInput.category,
        productInput.stock,
        productInput.imageKey,
        productInput.imageUrl,
        Number(productInput.isActive),
        now,
        now,
        productInput.currency,
      )
      .run()

    return this.getById(productId)
  }

  async update(productId, updates) {
    const existing = await this.getById(productId)

    if (!existing) {
      throw new NotFoundError('Product not found')
    }

    const nextProduct = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await this.db
      .prepare(
        `
          UPDATE products
          SET name = ?,
              description = ?,
              price = ?,
              category = ?,
              stock = ?,
              imageKey = ?,
              imageUrl = ?,
              isActive = ?,
              updatedAt = ?,
              currency = ?
          WHERE productId = ?
        `,
      )
      .bind(
        nextProduct.name,
        nextProduct.description,
        nextProduct.price,
        nextProduct.category,
        nextProduct.stock,
        nextProduct.imageKey,
        nextProduct.imageUrl,
        Number(nextProduct.isActive),
        nextProduct.updatedAt,
        nextProduct.currency,
        productId,
      )
      .run()

    return this.getById(productId)
  }

  async updateStock(productId, stock) {
    const existing = await this.getById(productId)

    if (!existing) {
      throw new NotFoundError('Product not found')
    }

    await this.db
      .prepare(
        `
          UPDATE products
          SET stock = ?, updatedAt = ?
          WHERE productId = ?
        `,
      )
      .bind(stock, new Date().toISOString(), productId)
      .run()

    return this.getById(productId)
  }
}

export function createProductsRepository(env = {}) {
  return new D1ProductsRepository(requireDb(env))
}
