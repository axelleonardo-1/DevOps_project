# Final Presentation Demo Checklist

Use this checklist during the live presentation of the DevOps final project. It is organized in presentation order so the team can move through the rubric with minimal improvisation.

## 1. Project Overview

- [ ] Open the repository root and show the project structure:
  - `frontend`
  - `services/products`
  - `services/orders`
  - `infra/terraform`
  - `docs`
- [ ] Open the project description document:
  - `docs/01-descripcion-proyecto.md`
- [ ] Explain the business purpose:
  - product catalog
  - order creation
  - order tracking
- [ ] Open and explain the architecture diagram:
  - `docs/05-diagrama-infraestructura.md`
- [ ] Open and explain the deployment diagram:
  - `docs/06-diagrama-deployment.md`

## 2. Backlog and Planning

- [ ] Open `BACKLOG.md`
- [ ] Show that the backlog is organized by category:
  - Project Setup
  - Frontend
  - Products Service
  - Orders Service
  - Database / D1
  - Storage / R2
  - Docker Development Environment
  - CI/CD Pipelines
  - Terraform Infrastructure
  - Observability / APM
  - Documentation
  - Final Demo
- [ ] Show that backlog items include:
  - ID
  - title
  - description
  - acceptance criteria
  - suggested branch name
  - suggested labels
- [ ] If using GitHub Issues or Azure Boards, show the equivalent board or issue list
- [ ] Explain which items are already completed and which remain as future improvements

## 3. Branch Strategy

- [ ] Open the Git repository in GitHub
- [ ] Show the `main` branch
- [ ] Show the `develop` branch
- [ ] Show at least one `feature/*` branch
- [ ] Explain the branch strategy:
  - `feature/*` for isolated work
  - `develop` for integration and dev deployments
  - `main` for stable production releases
- [ ] Explain PR strategy:
  - open pull request from feature branch
  - run checks
  - review and approval
  - merge into `develop`
- [ ] Explain production approval flow through GitHub Environments

## 4. Local Development with Docker

- [ ] Open terminal at repository root
- [ ] Run:

```bash
docker compose up --build
```

- [ ] Show that the frontend is available locally:
  - `http://localhost:5173`
- [ ] Show that the products service is available locally:
  - `http://localhost:3001/health`
- [ ] Show that the orders service is available locally:
  - `http://localhost:3002/health`
- [ ] Demonstrate the frontend locally:
  - open catalog
  - open product detail
  - open cart
  - open orders view
- [ ] Explain clearly:
  - Docker is used for local development
  - Docker is used for presentation evidence
  - Docker is not the production runtime

## 5. Code Change Demo

- [ ] Create or show a feature branch:

```bash
git checkout -b feature/demo-visible-change
```

- [ ] Make a small visible change in frontend or backend
- [ ] Show the changed file in the editor
- [ ] Run a quick local verification if appropriate
- [ ] Commit the change:

```bash
git add .
git commit -m "feat: add demo-visible change"
```

- [ ] Push the branch:

```bash
git push -u origin feature/demo-visible-change
```

- [ ] Open a Pull Request in GitHub

## 6. Pull Request Approval

- [ ] Open the Pull Request page
- [ ] Show PR checks running
- [ ] Show CI results:
  - install
  - build
  - tests
  - optional deploy-prep jobs
- [ ] Wait for checks to pass or show a previously successful PR if timing is tight
- [ ] Show approval flow:
  - reviewer approval
  - merge button
- [ ] Merge the Pull Request into `develop`

## 7. Dev Pipeline

- [ ] Open GitHub Actions
- [ ] Show the development pipeline triggered by `develop`
- [ ] Open workflow runs for:
  - frontend
  - products
  - orders
- [ ] Show install, build, and test steps
- [ ] Show products service deployment to development
- [ ] Show orders service deployment to development
- [ ] Show frontend deployment to development
- [ ] Open the DEV public URL:
  - `<DEV_FRONTEND_URL>`
- [ ] If available, show DEV API endpoints:
  - `<DEV_PRODUCTS_WORKER_URL>/health`
  - `<DEV_ORDERS_WORKER_URL>/health`

## 8. Production Promotion

- [ ] Show the promotion flow from `develop` to `main`
- [ ] Open a PR to `main` or show the already prepared merge flow
- [ ] Explain why production is protected
- [ ] Show manual approval requirement on GitHub Environment `production`
- [ ] Approve the production deployment when appropriate
- [ ] Open GitHub Actions production workflow run
- [ ] Show successful production deployment for:
  - frontend
  - products
  - orders
- [ ] Open the PROD public URL:
  - `<PROD_FRONTEND_URL>`
- [ ] If available, show PROD API endpoints:
  - `<PROD_PRODUCTS_WORKER_URL>/health`
  - `<PROD_ORDERS_WORKER_URL>/health`

## 9. Unit Tests

- [ ] Show products service tests in pipeline output
- [ ] Show orders service tests in pipeline output
- [ ] Show frontend tests if available
- [ ] If useful, run local tests before or during the presentation:

```bash
cd services/products && npm test
cd ../orders && npm test
```

- [ ] Explain what the tests validate:
  - products routes and repository behavior
  - orders routes and service orchestration
  - frontend tests only if implemented

## 10. Infrastructure as Code

- [ ] Open `infra/terraform`
- [ ] Show these files:
  - `main.tf`
  - `variables.tf`
  - `outputs.tf`
  - `versions.tf`
  - `terraform.tfvars.example`
  - `README.md`
- [ ] Explain D1 resources:
  - dev database
  - prod database
- [ ] Explain R2 resources if implemented:
  - dev bucket
  - prod bucket
- [ ] Explain that Workers and Pages deployment remains CI/CD-managed
- [ ] Show Terraform commands if useful:

```bash
cd infra/terraform
terraform fmt
terraform validate
terraform plan
```

- [ ] Open the Terraform pipeline in GitHub Actions
- [ ] Show:
  - `terraform fmt -check`
  - `terraform init`
  - `terraform validate`
  - `terraform plan`
- [ ] Explain that `terraform apply` is restricted to `main` with approval

## 11. Docker Hub

- [ ] Open Docker Hub
- [ ] Show the three images:
  - `DOCKERHUB_USERNAME/devops-ecommerce-frontend`
  - `DOCKERHUB_USERNAME/devops-ecommerce-products`
  - `DOCKERHUB_USERNAME/devops-ecommerce-orders`
- [ ] Show image tags:
  - branch name
  - commit SHA
  - `latest` for `main`
- [ ] Explain that Docker Hub is used as artifact evidence
- [ ] Explain that Docker Hub is not the production runtime

## 12. APM / Observability

- [ ] Open the Cloudflare dashboard
- [ ] Show Workers section
- [ ] Show logs for the products service
- [ ] Show logs for the orders service
- [ ] Show traces if available in the account plan and current setup
- [ ] Show error information or failed requests if available
- [ ] Show request metrics
- [ ] Show CPU time metrics
- [ ] Explain the runtime limitation clearly:
  - Cloudflare Workers is a serverless edge runtime
  - memory is not exposed in the same way as a VM or container
  - Docker local metrics can be used only as development evidence

## 13. Final Validation

- [ ] Open DEV URL:
  - `<DEV_FRONTEND_URL>`
- [ ] Open PROD URL:
  - `<PROD_FRONTEND_URL>`
- [ ] Execute a successful API request in browser, terminal, or API client:

```bash
curl <DEV_PRODUCTS_WORKER_URL>/products
curl <DEV_ORDERS_WORKER_URL>/orders
```

- [ ] Show database-backed data coming from D1
- [ ] If R2 is implemented, show a product image being served
- [ ] Show the final visible user-facing change in production
- [ ] Confirm that frontend, products, and orders are all aligned after deployment

## 14. Closing

- [ ] Explain what was migrated from the original AWS-oriented architecture:
  - DynamoDB-style persistence to D1
  - S3-style image storage to R2, if implemented
  - Lambda/serverless-http and Express runtime assumptions to Workers + Hono
  - S3/CloudFront-style frontend hosting to Cloudflare Pages
- [ ] Explain why the current architecture was selected:
  - Hono for Worker-friendly routing
  - Cloudflare Workers for serverless backend execution
  - D1 for lightweight SQL persistence
  - Pages for frontend deployment
- [ ] Present future improvements:
  - better authentication
  - more tests
  - advanced monitoring
  - R2 image handling if not completed
  - better IaC coverage
- [ ] Close with the final message:
  - the project demonstrates planning, coding, testing, deployment, infrastructure, observability, and artifact evidence as one DevOps workflow

## Optional Presenter Notes

- [ ] Prepare all URLs in advance:
  - `<DEV_FRONTEND_URL>`
  - `<PROD_FRONTEND_URL>`
  - `<DEV_PRODUCTS_WORKER_URL>`
  - `<PROD_PRODUCTS_WORKER_URL>`
  - `<DEV_ORDERS_WORKER_URL>`
  - `<PROD_ORDERS_WORKER_URL>`
- [ ] Make sure all required secrets and Cloudflare bindings are already configured
- [ ] Log into GitHub, Cloudflare, and Docker Hub before the presentation starts
- [ ] Keep one browser tab ready for:
  - GitHub repository
  - GitHub Actions
  - Cloudflare dashboard
  - Docker Hub
- [ ] Keep one terminal ready at repository root
- [ ] If live deployment timing is risky, prepare a previously successful run as backup evidence
