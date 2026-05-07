# Project Backlog

This backlog is designed to be directly reusable as a source for GitHub Issues or Azure Boards work items. The items are intentionally small enough to map to individual pull requests and are grouped by delivery area.

## Label Set

Use the following consistent labels across the backlog:

- `backend`
- `frontend`
- `infra`
- `ci-cd`
- `docs`
- `testing`
- `observability`
- `docker`
- `database`

## 1. Project Setup

### BL-001 - Reorganize monorepo structure

**Description**  
Move the existing applications and services into the monorepo layout: `frontend`, `services/products`, `services/orders`, `infra/terraform`, and `docs`.

**Acceptance Criteria**

- repository folders match the agreed monorepo layout
- existing source files, Dockerfiles, tests, and configuration files are preserved
- README reflects the new structure

**Suggested branch name**  
`feature/monorepo-structure`

**Suggested labels**  
`infra`, `docs`

### BL-002 - Create repository migration audit

**Description**  
Document the initial repository structure, current frameworks, routes, storage assumptions, and migration checklist before major architectural changes.

**Acceptance Criteria**

- audit document exists at the repository root
- document includes frontend, products, and orders analysis
- document includes Cloudflare migration checklist

**Suggested branch name**  
`feature/migration-audit`

**Suggested labels**  
`docs`, `infra`

## 2. Frontend

### BL-003 - Add frontend environment variable strategy

**Description**  
Update the frontend to support `VITE_PRODUCTS_API_URL`, `VITE_ORDERS_API_URL`, `VITE_API_GATEWAY_URL`, `VITE_API_MODE`, `VITE_APP_ENV`, and `VITE_APP_VERSION`.

**Acceptance Criteria**

- frontend resolves products and orders URLs from environment variables
- proxy mode continues to work locally
- `.env.example` documents the supported variables

**Suggested branch name**  
`feature/frontend-env-config`

**Suggested labels**  
`frontend`, `docs`

### BL-004 - Add development environment banner in frontend

**Description**  
Display a visible but simple banner when the application runs with `VITE_APP_ENV=dev`.

**Acceptance Criteria**

- dev banner is visible only in development environment
- production environment does not show the banner
- styling is consistent with the existing frontend

**Suggested branch name**  
`feature/frontend-dev-banner`

**Suggested labels**  
`frontend`

### BL-005 - Show frontend version in footer

**Description**  
Expose `VITE_APP_VERSION` in the footer to support release traceability during presentations and deployments.

**Acceptance Criteria**

- footer displays application version or commit SHA
- local fallback value exists
- version can be injected from CI/CD

**Suggested branch name**  
`feature/frontend-version-footer`

**Suggested labels**  
`frontend`

### BL-006 - Document frontend deployment configuration

**Description**  
Document how the frontend is built locally and deployed to Cloudflare Pages across development and production environments.

**Acceptance Criteria**

- frontend README explains env variables
- README explains dev and prod deployment assumptions
- local and Cloudflare deployment flows are described clearly

**Suggested branch name**  
`feature/frontend-readme-update`

**Suggested labels**  
`frontend`, `docs`

## 3. Products Service

### BL-007 - Migrate products service from Express to Hono

**Description**  
Replace the Express runtime with a Hono application compatible with Cloudflare Workers while preserving the core route structure.

**Acceptance Criteria**

- Hono app replaces Express runtime setup
- route paths remain compatible with the existing API contract
- `app.listen` is removed from runtime code

**Suggested branch name**  
`feature/products-hono-migration`

**Suggested labels**  
`backend`, `testing`

### BL-008 - Add products Worker health and version endpoints

**Description**  
Add operational endpoints for service health, database health placeholder, and version reporting.

**Acceptance Criteria**

- `/health` endpoint returns service health
- `/health/db` endpoint returns database binding status
- `/version` returns application version

**Suggested branch name**  
`feature/products-health-version`

**Suggested labels**  
`backend`, `observability`

### BL-009 - Add products repository abstraction

**Description**  
Introduce a repository layer to separate route handling from storage implementation.

**Acceptance Criteria**

- products routes use a repository abstraction
- SQL or storage logic is not embedded directly in route handlers
- repository can be swapped without changing route definitions

**Suggested branch name**  
`feature/products-repository`

**Suggested labels**  
`backend`, `database`

### BL-010 - Add products Worker tests without Express/Supertest

**Description**  
Add Worker-compatible tests for products routes using a framework such as Vitest.

**Acceptance Criteria**

- tests execute without Express or Supertest
- products CRUD and health routes are covered
- test command runs successfully from `services/products`

**Suggested branch name**  
`feature/products-worker-tests`

**Suggested labels**  
`backend`, `testing`

## 4. Orders Service

### BL-011 - Migrate orders service from Express to Hono

**Description**  
Replace the Express plus `serverless-http` runtime with a Hono Worker-compatible application.

**Acceptance Criteria**

- Hono app replaces Express and `serverless-http`
- route paths remain compatible with the existing orders API
- runtime uses Worker-style export instead of Lambda handler

**Suggested branch name**  
`feature/orders-hono-migration`

**Suggested labels**  
`backend`, `testing`

### BL-012 - Add orders Worker health and version endpoints

**Description**  
Add operational endpoints for general health and version reporting in the orders service.

**Acceptance Criteria**

- `/health` endpoint returns service health
- `/version` endpoint returns service version
- response includes runtime-oriented metadata where appropriate

**Suggested branch name**  
`feature/orders-health-version`

**Suggested labels**  
`backend`, `observability`

### BL-013 - Add orders repository abstraction

**Description**  
Introduce a repository layer for order storage and retrieval to separate routing from persistence concerns.

**Acceptance Criteria**

- orders routes use a repository abstraction
- create, list, detail, update, and delete operations go through the repository
- route handlers remain focused on HTTP and orchestration logic

**Suggested branch name**  
`feature/orders-repository`

**Suggested labels**  
`backend`, `database`

### BL-014 - Add orders Worker-compatible test suite

**Description**  
Create tests for orders routes and supporting services without depending on Express or Supertest.

**Acceptance Criteria**

- tests cover order lifecycle routes
- product service dependency is mocked or isolated
- test command runs successfully from `services/orders`

**Suggested branch name**  
`feature/orders-worker-tests`

**Suggested labels**  
`backend`, `testing`

## 5. Database / D1

### BL-015 - Add D1 schema migrations

**Description**  
Create D1 migration files for `products`, `orders`, and `order_items`.

**Acceptance Criteria**

- SQL migration files exist in the appropriate services
- schema includes the agreed primary keys and core fields
- SQL is compatible with D1 and SQLite-style semantics

**Suggested branch name**  
`feature/d1-migrations`

**Suggested labels**  
`database`, `backend`

### BL-016 - Add products D1 repository implementation

**Description**  
Replace temporary in-memory product persistence with D1 queries using `env.DB.prepare()`.

**Acceptance Criteria**

- products repository uses D1 binding
- list, get, create, update, and stock update operations persist correctly
- runtime no longer depends on temporary in-memory data

**Suggested branch name**  
`feature/products-d1-repository`

**Suggested labels**  
`database`, `backend`, `testing`

### BL-017 - Add orders D1 repository implementation

**Description**  
Replace temporary in-memory order persistence with D1-backed repositories for `orders` and `order_items`.

**Acceptance Criteria**

- orders repository uses D1 binding
- order creation persists both order header and items
- order retrieval returns hydrated items

**Suggested branch name**  
`feature/orders-d1-repository`

**Suggested labels**  
`database`, `backend`, `testing`

### BL-018 - Add seed data for products database

**Description**  
Create seed SQL or equivalent commands to populate development product data.

**Acceptance Criteria**

- seed data file exists for products
- local development can load sample products
- README explains how to run the seed flow

**Suggested branch name**  
`feature/products-seed-data`

**Suggested labels**  
`database`, `docs`

## 6. Storage / R2

### BL-019 - Add R2 binding configuration for product images

**Description**  
Configure development and production R2 bindings for product image storage in the products service.

**Acceptance Criteria**

- `wrangler.toml` includes dev and prod R2 bindings
- bucket binding names are consistent with runtime code
- configuration is documented

**Suggested branch name**  
`feature/products-r2-binding`

**Suggested labels**  
`backend`, `infra`

### BL-020 - Add multipart image upload for products using Web APIs

**Description**  
Restore product image upload using `request.formData()`, `File`, `ArrayBuffer`, and `crypto.randomUUID()`.

**Acceptance Criteria**

- `POST /products` supports optional multipart image upload
- `PUT /products/:id` supports optional multipart image upload
- runtime does not use `multer`, `Buffer`, or Node `path`

**Suggested branch name**  
`feature/products-r2-upload`

**Suggested labels**  
`backend`, `testing`

### BL-021 - Add product image retrieval endpoint

**Description**  
Expose an endpoint that returns the stored product image from R2.

**Acceptance Criteria**

- `GET /products/:id/image` returns the image when it exists
- missing image returns a controlled not found response
- response includes reasonable content headers

**Suggested branch name**  
`feature/products-image-endpoint`

**Suggested labels**  
`backend`, `testing`

### BL-022 - Add product image validation rules

**Description**  
Validate file type and maximum file size for product image uploads.

**Acceptance Criteria**

- only PNG, JPEG, and WEBP are accepted
- oversized files are rejected
- tests cover valid and invalid upload cases

**Suggested branch name**  
`feature/products-image-validation`

**Suggested labels**  
`backend`, `testing`

## 7. Docker Development Environment

### BL-023 - Add Dockerfile for frontend local development

**Description**  
Create or update the frontend Dockerfile so the application can run inside the local Compose environment.

**Acceptance Criteria**

- frontend Dockerfile exists and builds successfully
- local development port is exposed correctly
- Dockerfile does not redefine production runtime assumptions

**Suggested branch name**  
`feature/frontend-dockerfile`

**Suggested labels**  
`docker`, `frontend`

### BL-024 - Add Dockerfile updates for products and orders services

**Description**  
Prepare Dockerfiles for both backend services to support local development and evidence builds.

**Acceptance Criteria**

- products Dockerfile builds locally
- orders Dockerfile builds locally
- service ports align with local development expectations

**Suggested branch name**  
`feature/services-dockerfiles`

**Suggested labels**  
`docker`, `backend`

### BL-025 - Add root Docker Compose local environment

**Description**  
Create `docker-compose.yml` to run frontend, products, and orders together for development and presentation evidence.

**Acceptance Criteria**

- compose file exists at repository root
- frontend, products, and orders are exposed on expected local ports
- required environment variables are defined for local orchestration

**Suggested branch name**  
`feature/docker-compose-local`

**Suggested labels**  
`docker`, `infra`

### BL-026 - Document Docker local workflow

**Description**  
Update documentation to explain how to start and stop the local Docker environment and what it is used for.

**Acceptance Criteria**

- README includes `docker compose up --build`
- README clarifies Docker is not the production runtime
- Docker Hub role is documented as artifact evidence

**Suggested branch name**  
`feature/docker-docs`

**Suggested labels**  
`docker`, `docs`

## 8. CI/CD Pipelines

### BL-027 - Add products Cloudflare Workers CI/CD workflow

**Description**  
Create a GitHub Actions workflow that validates and deploys the products Worker to development and production.

**Acceptance Criteria**

- workflow runs on pull requests and pushes to `develop` and `main`
- tests run before deployment
- production deployment uses GitHub Environment approval

**Suggested branch name**  
`feature/products-ci-cd`

**Suggested labels**  
`ci-cd`, `backend`

### BL-028 - Add orders Cloudflare Workers CI/CD workflow

**Description**  
Create a GitHub Actions workflow that validates and deploys the orders Worker to development and production.

**Acceptance Criteria**

- workflow runs on pull requests and pushes to `develop` and `main`
- tests run before deployment
- production deployment uses GitHub Environment approval

**Suggested branch name**  
`feature/orders-ci-cd`

**Suggested labels**  
`ci-cd`, `backend`

### BL-029 - Add frontend Cloudflare Pages CI/CD workflow

**Description**  
Create a GitHub Actions workflow that builds and deploys the frontend to Cloudflare Pages for development and production.

**Acceptance Criteria**

- frontend build runs in CI
- deployment occurs on `develop` and `main`
- production deployment is protected by manual approval

**Suggested branch name**  
`feature/frontend-ci-cd`

**Suggested labels**  
`ci-cd`, `frontend`

### BL-030 - Add Docker Hub build and publish workflow

**Description**  
Create a workflow that builds Docker images for frontend, products, and orders and publishes them to Docker Hub on `develop` and `main`.

**Acceptance Criteria**

- pull requests validate image builds without push
- pushes to `develop` and `main` publish tagged images
- image tags include branch and short SHA

**Suggested branch name**  
`feature/dockerhub-workflow`

**Suggested labels**  
`ci-cd`, `docker`

### BL-031 - Add Terraform validation and apply workflow

**Description**  
Create a GitHub Actions workflow for Terraform validation, plan, and guarded apply.

**Acceptance Criteria**

- workflow runs `fmt`, `init`, and `validate`
- pull requests and `develop` run `plan`
- only `main` can run `apply`
- production apply requires environment approval

**Suggested branch name**  
`feature/terraform-pipeline`

**Suggested labels**  
`ci-cd`, `infra`

## 9. Terraform Infrastructure

### BL-032 - Add Cloudflare Terraform provider configuration

**Description**  
Create the base Terraform files for Cloudflare provider setup, variables, outputs, and version constraints.

**Acceptance Criteria**

- `versions.tf`, `variables.tf`, `main.tf`, and `outputs.tf` exist
- provider configuration uses variables instead of hardcoded secrets
- configuration validates successfully

**Suggested branch name**  
`feature/terraform-cloudflare-provider`

**Suggested labels**  
`infra`, `database`

### BL-033 - Add Terraform-managed D1 resources

**Description**  
Model the development and production D1 databases in Terraform.

**Acceptance Criteria**

- dev and prod D1 resources are declared
- outputs expose database IDs and names
- README explains the purpose of these resources

**Suggested branch name**  
`feature/terraform-d1`

**Suggested labels**  
`infra`, `database`

### BL-034 - Add Terraform-managed R2 resources

**Description**  
Model optional development and production R2 buckets used by product images.

**Acceptance Criteria**

- dev and prod R2 resources are declared when enabled
- outputs expose bucket names
- README explains that R2 is optional

**Suggested branch name**  
`feature/terraform-r2`

**Suggested labels**  
`infra`, `database`

### BL-035 - Document CI-managed Cloudflare deployables in Terraform

**Description**  
Document placeholder ownership for Workers and Pages resources that are deployed by CI/CD rather than fully managed by Terraform.

**Acceptance Criteria**

- Terraform README explains what Terraform creates
- Terraform README explains what CI/CD deploys
- Worker and Pages placeholders are documented clearly

**Suggested branch name**  
`feature/terraform-readme`

**Suggested labels**  
`infra`, `docs`

## 10. Observability / APM

### BL-036 - Add request logging middleware to products service

**Description**  
Add request logging middleware that records request ID, method, path, status, and duration in the products service.

**Acceptance Criteria**

- every products request generates a structured log
- request ID is available for error correlation
- middleware is integrated at application level

**Suggested branch name**  
`feature/products-request-logging`

**Suggested labels**  
`backend`, `observability`

### BL-037 - Add request logging middleware to orders service

**Description**  
Add request logging middleware that records request ID, method, path, status, and duration in the orders service.

**Acceptance Criteria**

- every orders request generates a structured log
- request ID is available for error correlation
- middleware is integrated at application level

**Suggested branch name**  
`feature/orders-request-logging`

**Suggested labels**  
`backend`, `observability`

### BL-038 - Add centralized error handling for Workers

**Description**  
Standardize error responses and structured error logging in both Worker services.

**Acceptance Criteria**

- both services use a centralized error handler
- business and internal errors return consistent response shapes
- logs include enough detail for troubleshooting

**Suggested branch name**  
`feature/workers-error-handling`

**Suggested labels**  
`backend`, `observability`, `testing`

### BL-039 - Document Cloudflare Observability strategy

**Description**  
Create documentation that explains logs, traces, errors, request metrics, CPU time, and the limits of memory-level visibility in Workers.

**Acceptance Criteria**

- observability document exists in `docs`
- Cloudflare-specific metrics are explained
- distinction between cloud observability and local Docker evidence is clear

**Suggested branch name**  
`feature/observability-docs`

**Suggested labels**  
`observability`, `docs`

## 11. Documentation

### BL-040 - Create project architecture documentation set

**Description**  
Create the main documentation package describing the project, stack, architecture, infrastructure, deployment flow, and pipelines.

**Acceptance Criteria**

- documentation exists in the `docs` folder
- component, infrastructure, and deployment diagrams use Mermaid
- documentation is presentation-ready and aligned with implemented code

**Suggested branch name**  
`feature/project-docs`

**Suggested labels**  
`docs`, `infra`

### BL-041 - Add service-level migration documentation

**Description**  
Update service READMEs to describe migration from AWS-oriented patterns toward Cloudflare-native architecture.

**Acceptance Criteria**

- products README explains Hono, D1, and R2 usage
- orders README explains Hono and D1 usage
- setup instructions are current

**Suggested branch name**  
`feature/service-readmes`

**Suggested labels**  
`docs`, `backend`

### BL-042 - Create backlog and planning document

**Description**  
Create a structured backlog that can be converted into GitHub Issues or Azure Boards work items.

**Acceptance Criteria**

- backlog is organized by area
- each item includes ID, title, description, acceptance criteria, branch name, and labels
- tasks are sized for individual pull requests

**Suggested branch name**  
`feature/project-backlog`

**Suggested labels**  
`docs`

## 12. Final Demo

### BL-043 - Create final demo presentation script

**Description**  
Prepare a step-by-step demonstration guide that covers the repository, application, Cloudflare resources, pipelines, Docker, Docker Hub, and Terraform.

**Acceptance Criteria**

- demo script exists in `docs`
- script includes suggested walkthrough order
- script avoids claiming unimplemented features

**Suggested branch name**  
`feature/demo-script`

**Suggested labels**  
`docs`

### BL-044 - Create final demo checklist

**Description**  
Create a concise checklist to ensure the team verifies environments, secrets, local services, and presentation artifacts before the final demonstration.

**Acceptance Criteria**

- checklist covers frontend, backend, Docker, Cloudflare, and GitHub Actions
- checklist can be used on demo day
- checklist is short and practical

**Suggested branch name**  
`feature/demo-checklist`

**Suggested labels**  
`docs`, `testing`

### BL-045 - Prepare evidence pack for rubric review

**Description**  
Assemble the final evidence set needed for evaluation, including Docker Hub images, workflow runs, Terraform plan/apply output, and architecture documentation.

**Acceptance Criteria**

- evidence sources are identified and documented
- Docker Hub, GitHub Actions, Terraform, and Cloudflare are all covered
- the team can use the document to gather screenshots or links consistently

**Suggested branch name**  
`feature/evidence-pack`

**Suggested labels**  
`docs`, `ci-cd`, `infra`
