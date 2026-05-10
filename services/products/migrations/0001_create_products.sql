CREATE TABLE IF NOT EXISTS products (
  productId TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT,
  stock INTEGER NOT NULL,
  imageUrl TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT,
  updatedAt TEXT,
  currency TEXT NOT NULL DEFAULT 'MXN'
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(isActive);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
