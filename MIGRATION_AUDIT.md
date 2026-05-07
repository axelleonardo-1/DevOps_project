# Migration Audit

Audit date: 2026-05-06

Scope: repository structure, application frameworks, package scripts, backend routes, Cloudflare Workers compatibility risks, storage/database assumptions, and migration checklist. No source files were modified.

## 1. Application and Service Folders

The repository contains three main applications/services:

| Folder | Role | Notes |
| --- | --- | --- |
| `frontend` | Frontend application | Vue-based ecommerce UI for catalog, cart, checkout, and orders. |
| `services/products` | Products backend service | Manages product catalog, stock, product image upload, Swagger docs, and DynamoDB health checks. |
| `services/orders` | Orders backend service | Manages order lifecycle, calls products service, simulates payments, and stores orders. |

## 2. Current Frameworks and Runtime Model

| App/service | Current framework/runtime | Entry points |
| --- | --- | --- |
| `frontend` | Vue 3, Vite, Pinia, Vue Router, Tailwind CSS | `src/main.js`, `src/router/index.js`, `vite.config.js` |
| `services/products` | Node.js CommonJS, Express 5 | `index.js` |
| `services/orders` | Node.js CommonJS, Express 5, `serverless-http` for AWS Lambda | `src/index.js` exports `handler` |

Deployment assumptions found in repo:

- Frontend buildspec deploys `dist/` to AWS S3 and invalidates CloudFront.
- Products service Dockerfile runs a Node 20 Alpine Express server on port 3000.
- Orders service Dockerfile uses AWS Lambda Node.js 22 base image and `serverless-http`.
- Backend buildspec files install dependencies and run tests.

## 3. package.json Scripts

### `frontend`

| Script | Command |
| --- | --- |
| `dev` | `vite` |
| `build` | `vite build` |
| `preview` | `vite preview` |
| `format` | `prettier --write --experimental-cli src/` |

### `services/products`

| Script | Command |
| --- | --- |
| `start` | `node index.js` |
| `dev` | `nodemon index.js` |
| `seed` | `node scripts/seed.js` |
| `test` | `jest --coverage` |

### `services/orders`

| Script | Command |
| --- | --- |
| `test` | `jest` |
| `test:coverage` | `jest --coverage` |
| `dev` | `nodemon src/index.js` |

Note: orders service has no `start` script. Local listening only happens when `ENV=dev`; otherwise the service exports an AWS Lambda handler.

## 4. Existing Routes

### Frontend Routes

Defined in `frontend/src/router/index.js`:

| Path | Name | View |
| --- | --- | --- |
| `/` | `home` | `CatalogView.vue` |
| `/product/:id` | `product-detail` | `ProductDetailView.vue` |
| `/cart` | `cart` | `CartView.vue` |
| `/orders` | `orders` | `OrdersView.vue` |
| `/orders/:id` | `order-detail` | `OrderDetailView.vue` |

Frontend API assumptions:

- Products API base URL comes from `VITE_API_GATEWAY_URL`, or `http://localhost:3000` by default.
- Orders API base URL comes from `VITE_ORDERS_API_URL`, then `VITE_API_GATEWAY_URL`, or `http://localhost:3001` by default.
- `VITE_API_MODE=proxy` makes requests same-origin through the Vite dev server.

### Products Service Routes

Mounted from `index.js` with `app.use('/products', productRoutes)`.

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| `GET` | `/products` | `getProducts` | List products with optional `category`, `minPrice`, `maxPrice`, and `isActive` filters. |
| `GET` | `/products/:id` | `getProductById` | Fetch one product by `productId`. |
| `POST` | `/products` | `createProduct` | Create a product; accepts multipart `image` upload. |
| `PUT` | `/products/:id` | `updateProduct` | Update product fields and optional image. |
| `PUT` | `/products/:id/stock` | `updateProductStock` | Replace stock quantity. |

Additional products service routes:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health/db` | Calls DynamoDB `ListTablesCommand`. |
| `GET` | `/health/db/table` | Scans the configured products table with `Limit: 1`. |
| `GET` | `/api-docs` | Swagger UI from `swagger-ui-express`. |
| `GET` | `/coverage` | Static Jest coverage report from local filesystem. |

### Orders Service Routes

Mounted from `src/index.js` with `app.use('/orders', orderRoutes)`.

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| `GET` | `/orders` | `getAllOrders` | Scan all orders. |
| `GET` | `/orders/:id` | `getOrderById` | Fetch one order by `orderId`. |
| `POST` | `/orders` | `postOrder` | Create an order, validate product stock through products service, simulate payment, store order, then reduce stock when paid/confirmed. |
| `PUT` | `/orders/:id/status` | `putOrder` | Update order status and reduce stock when changed to paid/confirmed. |
| `DELETE` | `/orders/:id` | `deleteOrder` | Delete an order. |

Additional orders service route:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Basic service health response. |

## 5. Dependencies and Patterns That May Not Work in Cloudflare Workers

Cloudflare Workers use a Web API runtime, not a full Node.js server runtime. Compatibility depends on whether the project uses Workers with Node compatibility flags, a Worker-compatible framework, and Web API-compatible libraries.

### High-risk backend dependencies/patterns

| Dependency/pattern | Found in | Risk for Workers |
| --- | --- | --- |
| `express` | Products and orders services | Express expects Node HTTP server primitives. Workers use `fetch(request, env, ctx)`. Migration likely needs Hono, itty-router, native Worker handlers, or a compatibility adapter. |
| `app.listen` | Products service, orders dev mode | Workers do not listen on ports. They export request handlers. |
| `serverless-http` | Orders service | AWS Lambda adapter, not useful for Workers. |
| `dotenv` / `process.env` | Both backend services | Workers use `env` bindings and Wrangler variables/secrets. `process.env` is not the native configuration model. |
| `multer` | Products service | Built for Node/Express multipart parsing and Buffers. Workers should parse `request.formData()` and upload `File`/`ArrayBuffer`/`ReadableStream` objects. |
| `Buffer` | Products tests and image upload flow | Workers support Web binary primitives first. Node Buffer may require compatibility and should usually be replaced by `ArrayBuffer`/`Uint8Array`. |
| Node `path` | Products `index.js`, `utils/s3Client.js`, Vite config uses `node:url` | Backend Worker code should avoid Node filesystem/path assumptions. Frontend Vite config is build-time Node code and is not a Worker runtime issue. |
| Node `crypto` via `require('crypto')` | Products and orders services | Workers provide Web Crypto at `crypto.randomUUID()`. Node `require('crypto')` should be replaced. |
| `express.static` and local coverage serving | Products service | Workers cannot serve arbitrary local filesystem paths at runtime. Static assets should be deployed through Pages/Assets/R2 or removed from API runtime. |
| `swagger-ui-express` / `swagger-jsdoc` | Products service | Express-specific UI middleware and runtime filesystem scanning are poor fits for Workers. Prefer static OpenAPI JSON plus a static docs page, or external docs. |
| AWS Lambda container model | Orders Dockerfile | Workers deployment model is not Docker/Lambda based. |
| AWS SDK credential provider assumptions | Both backend services | AWS SDK v3 can be browser/fetch capable in some cases, but Workers require careful credential/env handling. Direct AWS access from Workers may also add latency and secret-management concerns. |

### Lower-risk frontend dependencies/patterns

| Dependency/pattern | Found in | Risk for Cloudflare |
| --- | --- | --- |
| Vue/Vite/Pinia/Vue Router/Tailwind | Frontend | Suitable for Cloudflare Pages as a static SPA. |
| Axios | Frontend | Works in browsers. Could stay, though native `fetch` is also available. |
| Vite dev proxy | Frontend | Development-only. Cloudflare Pages needs production environment variables or Pages Functions routing. |

## 6. Current Database and Storage Assumptions

### Products Service

- Database: DynamoDB table named by `PRODUCTS_TABLE`, documented as `Products`.
- Primary key: `productId` string.
- Access pattern:
  - `ScanCommand` for product listing and filters.
  - `GetCommand` for product detail.
  - `PutCommand` for create.
  - `UpdateCommand` for product updates and stock replacement.
- Image storage: AWS S3 bucket named by `S3_BUCKET_NAME`.
- Image URL format is manually constructed as `https://{bucket}.s3.{region}.amazonaws.com/products/{uuid.ext}`.
- Upload implementation uses `@aws-sdk/client-s3`, `@aws-sdk/lib-storage`, `multer.memoryStorage()`, Node `Buffer`, Node `path.extname`, and Node `crypto.randomUUID()`.
- Local development can use `DYNAMODB_ENDPOINT` for DynamoDB-compatible local endpoints and local placeholder credentials.
- Seed script writes 20 sample products to DynamoDB.

### Orders Service

- Database: DynamoDB table named by `ORDERS_TABLE`, documented as `Orders`.
- Primary key: `orderId` string.
- Access pattern:
  - `ScanCommand` for all orders.
  - `GetCommand` for order detail.
  - `PutCommand` for create.
  - `UpdateCommand` with condition expression for status update.
  - `DeleteCommand` for delete.
- Service-to-service dependency: `PRODUCTS_SERVICE_URL` is required for order creation/status changes.
- Orders service does not directly read the products table; it calls products service REST endpoints.
- Payment is simulated in-process with `Math.random()` and a 2-second `setTimeout`.
- Stock reduction is implemented by reading product stock from products service, calculating `newStock`, then calling `PUT /products/:id/stock`.

### Frontend

- No persistent browser storage was found in the current cart store; cart state is in-memory Pinia state.
- Production deployment currently assumes static assets hosted on S3 and CloudFront.
- Runtime API URLs are provided through Vite environment variables at build time.

## 7. Migration Checklist

### Repository and Deployment

- [ ] Decide target Cloudflare shape: Cloudflare Pages for frontend plus separate Workers for products/orders, or Pages plus Pages Functions.
- [ ] Add Cloudflare configuration (`wrangler.toml` or equivalent) per Worker/app.
- [ ] Replace AWS CodeBuild/S3/CloudFront deployment with Cloudflare Pages/Workers deployment workflow.
- [ ] Define per-environment variables and secrets in Wrangler/Cloudflare dashboard.
- [ ] Decide whether to keep three deployables or consolidate backend routes into one Worker.

### Frontend

- [ ] Configure Cloudflare Pages build command as `npm run build` in `frontend`.
- [ ] Configure Pages output directory as `dist`.
- [ ] Set `VITE_API_GATEWAY_URL` and, if needed, `VITE_ORDERS_API_URL` for Cloudflare environments.
- [ ] Add SPA fallback handling so deep links like `/orders/:id` and `/product/:id` resolve correctly.
- [ ] Decide whether API calls should go to separate Worker domains, same-zone routes, or Pages Functions.

### Products Service

- [ ] Replace Express app with a Worker-compatible request handler or framework.
- [ ] Replace `app.listen` with Worker `fetch` export.
- [ ] Replace `process.env` and `dotenv` with Worker `env` bindings.
- [ ] Replace `multer` multipart handling with `request.formData()`.
- [ ] Replace Node `Buffer`, `path`, and `require('crypto')` usages with Web APIs.
- [ ] Decide whether product images stay in S3 or migrate to Cloudflare R2.
- [ ] If migrating to R2, replace S3 upload code with R2 bucket bindings and update `imageUrl` generation/public access strategy.
- [ ] If keeping S3/DynamoDB, verify AWS SDK usage in Workers and configure credentials/secrets safely.
- [ ] Remove or rework `/coverage` static filesystem route.
- [ ] Replace Swagger Express middleware with static OpenAPI docs or Worker-compatible docs route.
- [ ] Revisit product list filtering because DynamoDB `Scan` can become expensive; consider indexed queries or D1/R2/KV-compatible data model if changing storage.

### Orders Service

- [ ] Replace Express plus `serverless-http` Lambda adapter with Worker-compatible request handling.
- [ ] Replace `process.env` and `dotenv` with Worker `env` bindings.
- [ ] Replace Node `require('crypto').randomUUID` with Web `crypto.randomUUID()`.
- [ ] Keep native `fetch` for products service calls, but inject base URL from Worker env.
- [ ] Review 2-second simulated payment delay against Worker CPU/wall-time expectations and user experience.
- [ ] Decide whether orders remain in DynamoDB or migrate to Cloudflare D1/KV/Durable Objects.
- [ ] Make stock deduction concurrency-safe. Current flow reads stock then writes replacement stock through products service, which can race under concurrent orders.
- [ ] Add or preserve route-level CORS behavior after removing Express `cors`.

### Data Migration

- [ ] Export current DynamoDB `Products` and `Orders` data.
- [ ] Choose destination storage:
  - DynamoDB retained behind Workers.
  - Cloudflare D1 for relational-style querying.
  - Cloudflare KV for simple key-value reads with eventual consistency.
  - Durable Objects for strongly coordinated stock/order workflows.
  - R2 for product images.
- [ ] Map product schema, including `productId`, inventory fields, timestamps, and `imageUrl`.
- [ ] Map order schema, including `orderId`, `items`, status values, totals, currency, and timestamps.
- [ ] Plan image object migration from S3 to R2 if applicable.
- [ ] Update frontend/API URLs only after backend routes are deployed and tested.

### Testing and Verification

- [ ] Keep or port Jest/Supertest tests to Worker-compatible tests where needed.
- [ ] Add Worker integration tests for all routes.
- [ ] Verify multipart product image creation/update.
- [ ] Verify CORS from deployed frontend to deployed API routes.
- [ ] Verify order creation with product lookup, stock validation, payment simulation, order persistence, and stock update.
- [ ] Verify deep-link reloads in the frontend on Cloudflare Pages.
- [ ] Verify secrets are not bundled into frontend builds.
