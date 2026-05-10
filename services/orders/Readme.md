# Orders Service

This service has been migrated from Express plus `serverless-http` to Hono targeting the Cloudflare Workers runtime with Cloudflare D1 persistence.

## Scope of This Phase

This phase focuses on runtime compatibility:

- Express and `serverless-http` were removed from runtime usage.
- The service now exports a Worker-compatible Hono app.
- Runtime configuration uses Worker bindings through `c.env`.
- DynamoDB access was replaced with a D1-backed repository abstraction.
- Product lookups and stock updates still happen through `fetch` using `PRODUCTS_SERVICE_URL`.
- Payment simulation remains in place, but the delay is now short and configurable so tests do not wait unnecessarily.

This phase does not:

- implement final D1 SQL persistence
- modify the products service or frontend
- remove the existing business flow for order creation and status updates

## Routes

The route surface remains:

- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PUT /orders/:id/status`
- `DELETE /orders/:id`

Additional Worker-friendly endpoints:

- `GET /health`
- `GET /version`

## Storage Strategy

This service now persists data in Cloudflare D1.

- `src/repositories/orders.repository.js` contains the SQL-backed repository abstraction.
- Migrations live in `migrations/`.
- Orders are stored in `orders`.
- Line items are stored in `order_items`.
- Order creation uses a grouped D1 `batch()` write so the order row and item rows are inserted together.

## Local Development

Install dependencies and run the Worker locally:

```bash
npm install
npm run dev
```

Wrangler serves the Worker on port `3002`.

## Configuration

The Worker configuration lives in `wrangler.toml`.

- `PRODUCTS_SERVICE_URL` must point to the products service.
- `APP_VERSION` and `ORDERS_STORAGE_DRIVER` are exposed as Worker vars.
- `PAYMENT_DELAY_MS` can be reduced to `0` in tests or local scenarios.
- `DB` is the D1 binding used by the repository.

## D1 Setup

Create the D1 databases:

```bash
npx wrangler d1 create orders-db-dev
npx wrangler d1 create orders-db-prod
```

After creation, copy the real `database_id` values into `wrangler.toml`.

Run migrations locally:

```bash
npx wrangler d1 migrations apply DB --local --env dev
```

Run migrations remotely:

```bash
npx wrangler d1 migrations apply DB --remote --env production
```

Seeding local data:

- no dedicated seed SQL is required for orders in this phase
- create orders through the API after the schema migration is applied

## Testing

Tests now run with Vitest and call the Hono app directly without Express or Supertest:

```bash
npm test
```
