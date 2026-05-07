# Products Service

This service has been migrated from Express to Hono and now targets the Cloudflare Workers runtime with Cloudflare D1 persistence and Cloudflare R2 for product images.

## Scope of This Phase

This phase changes the runtime structure only:

- Express server setup was replaced with Hono.
- `app.listen()` was removed and the service now exports a Worker-compatible app.
- Runtime `process.env` usage was replaced with Worker bindings through `c.env`.
- DynamoDB access was replaced with a D1-backed repository abstraction.
- Multipart upload now uses `request.formData()`, `File`, `ArrayBuffer`, and `crypto.randomUUID()`.
- Product images are stored in R2 instead of the previous S3-style object storage flow.

This phase does not:

- implement image processing or resizing
- restore Swagger UI
- restore coverage file serving from the API runtime

## Routes

The route surface remains:

- `GET /products`
- `GET /products/:id`
- `GET /products/:id/image`
- `POST /products`
- `PUT /products/:id`
- `PUT /products/:id/stock`

Additional Worker-friendly endpoints:

- `GET /health`
- `GET /health/db`
- `GET /version`

## Storage Strategy

This service now persists products in Cloudflare D1.

- `src/repositories/products.repository.js` contains the SQL-backed repository abstraction.
- Migrations live in `migrations/`.
- Seed SQL lives in `seeds/products.seed.sql`.
- `GET /health/db` checks the D1 binding and returns the current product count.
- Product binaries are stored in R2 using the `PRODUCT_IMAGES_BUCKET` binding.
- Product metadata stores both `imageKey` and `imageUrl`.

## Local Development

Install dependencies and run the Worker locally:

```bash
npm install
npm run dev
```

By default, Wrangler serves the Worker on port `3001`.

## Wrangler Configuration

The Worker configuration lives in `wrangler.toml`.

- `env.dev` and `env.production` both define a D1 binding named `DB`.
- `env.dev` and `env.production` both define an R2 binding named `PRODUCT_IMAGES_BUCKET`.
- Replace the placeholder `database_id` values with real D1 database IDs after running `wrangler d1 create`.
- Replace the bucket names if your environments use different R2 buckets.

## D1 Setup

Create the D1 databases:

```bash
npx wrangler d1 create products-db-dev
npx wrangler d1 create products-db-prod
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

Seed local data:

```bash
npx wrangler d1 execute DB --local --env dev --file=./seeds/products.seed.sql
```

Seed remote data:

```bash
npx wrangler d1 execute DB --remote --env production --file=./seeds/products.seed.sql
```

## R2 Setup

Create the R2 buckets:

```bash
npx wrangler r2 bucket create products-images-dev
npx wrangler r2 bucket create products-images-prod
```

The Worker stores product images in R2 and serves them through:

```text
GET /products/:id/image
```

Supported image types:

- `image/png`
- `image/jpeg`
- `image/webp`

The maximum upload size is controlled by `MAX_PRODUCT_IMAGE_BYTES` and defaults to `5242880` bytes.

## Notes About Removed Express-only Features

The following routes were removed on purpose because they depended on Express middleware or local filesystem behavior that does not fit the Worker runtime:

- `/api-docs`
- `/coverage`

Those can be reintroduced later using Worker-compatible tooling if needed.

## Testing

Tests now run with Vitest and call the Hono app directly without Express or Supertest:

```bash
npm test
```
