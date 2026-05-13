PRAGMA defer_foreign_keys = on;

CREATE TABLE IF NOT EXISTS orders (
  orderId TEXT PRIMARY KEY,
  userId TEXT,
  customerName TEXT,
  customerEmail TEXT,
  status TEXT NOT NULL,
  subtotal REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId TEXT NOT NULL,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unitPrice REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(orderId);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(productId);
