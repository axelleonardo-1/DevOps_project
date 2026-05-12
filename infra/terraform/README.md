# Terraform Infrastructure

This folder contains a presentation-friendly Terraform setup for the Cloudflare-native target architecture.

## What Terraform Creates

Terraform manages the shared platform resources that the applications depend on:

- `cloudflare_d1_database.dev`
- `cloudflare_d1_database.prod`
- `cloudflare_r2_bucket.dev` for product images when `enable_r2 = true`
- `cloudflare_r2_bucket.prod` for product images when `enable_r2 = true`

In this project, that means:

- one D1 database for development
- one D1 database for production
- one optional R2 bucket for development product images
- one optional R2 bucket for production product images

## What CI/CD Deploys

The application code is still deployed by GitHub Actions and Wrangler, not by Terraform:

- `services/products` deploys the Products Worker
- `services/orders` deploys the Orders Worker
- `frontend` deploys to Cloudflare Pages

This split keeps the demo easier to explain:

- Terraform creates the Cloudflare data/storage foundations
- CI/CD deploys the application code that uses them

## Notes About Cloudflare Observability

Cloudflare Observability covers logs, traces, errors, request volume, and CPU time once the Workers and Pages app are deployed. That operational telemetry is part of the Cloudflare platform, but it is not forced into this Terraform example yet because the project currently focuses on infrastructure basics for the final demo.

## Files

- `versions.tf`: Terraform and provider version constraints
- `variables.tf`: input variables
- `main.tf`: Cloudflare provider and resource definitions
- `outputs.tf`: IDs and names needed by Wrangler and CI/CD
- `terraform.tfvars.example`: placeholder values for local setup

## Prerequisites

Before running Terraform, make sure you have:

- Terraform installed
- a Cloudflare account
- a Cloudflare API token with permissions for D1 and R2
- your Cloudflare `account_id`

## Setup

1. Copy the example variable file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Replace the placeholder values in `terraform.tfvars` with your own Cloudflare values.

## Commands

Initialize the working directory:

```bash
terraform init
```

Format the Terraform files:

```bash
terraform fmt
```

Validate the configuration:

```bash
terraform validate
```

Preview the changes:

```bash
terraform plan
```

Apply the infrastructure:

```bash
terraform apply
```

## After Apply

After Terraform finishes:

1. Copy the D1 database IDs from the Terraform outputs.
2. Copy the R2 bucket names if R2 is enabled.
3. Update the `wrangler.toml` files in:
   - `services/products`
   - `services/orders`
4. Add the same values to GitHub repository or environment secrets if your CI/CD flow expects them.

## Resource Ownership Summary

- Terraform owns:
  - D1 databases
  - optional R2 buckets

- GitHub Actions and Wrangler own:
  - Products Worker deploys
  - Orders Worker deploys
  - Frontend Pages deploys

- Manual or later enhancement:
  - Cloudflare Pages project lifecycle in Terraform
  - deeper Observability dashboards and alerting configuration
