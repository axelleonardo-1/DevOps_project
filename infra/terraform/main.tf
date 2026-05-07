provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

locals {
  dev_d1_name  = "${var.project_name}-dev"
  prod_d1_name = "${var.project_name}-prod"

  dev_r2_name  = "${var.project_name}-product-images-dev"
  prod_r2_name = "${var.project_name}-product-images-prod"

  # These names are documented here so the Terraform state, Wrangler config,
  # and GitHub Actions workflows all speak the same language during demos.
  # Actual Workers and Pages deployments remain CI/CD-managed.
  products_worker_name = "${var.project_name}-products"
  orders_worker_name   = "${var.project_name}-orders"
  pages_project_name   = "${var.project_name}-frontend"
}

resource "cloudflare_d1_database" "dev" {
  account_id            = var.account_id
  name                  = local.dev_d1_name
  primary_location_hint = var.d1_primary_location_hint
}

resource "cloudflare_d1_database" "prod" {
  account_id            = var.account_id
  name                  = local.prod_d1_name
  primary_location_hint = var.d1_primary_location_hint
}

resource "cloudflare_r2_bucket" "dev" {
  count      = var.enable_r2 ? 1 : 0
  account_id = var.account_id
  name       = local.dev_r2_name
  location   = var.r2_location
}

resource "cloudflare_r2_bucket" "prod" {
  count      = var.enable_r2 ? 1 : 0
  account_id = var.account_id
  name       = local.prod_r2_name
  location   = var.r2_location
}

# Placeholder only:
# Products Worker deployment is handled by Wrangler in GitHub Actions
# using services/products/wrangler.toml and the environment-specific D1/R2 IDs
# created by this Terraform stack.

# Placeholder only:
# Orders Worker deployment is handled by Wrangler in GitHub Actions
# using services/orders/wrangler.toml and the environment-specific D1 IDs
# created by this Terraform stack.

# Placeholder only:
# The frontend Cloudflare Pages project can be created manually or managed later
# in Terraform if the team wants full lifecycle control here. For this phase,
# code deployment remains CI/CD-managed to keep the demo path straightforward.
