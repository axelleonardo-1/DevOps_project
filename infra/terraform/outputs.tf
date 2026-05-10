output "d1_database_names" {
  description = "Cloudflare D1 database names for development and production."
  value = {
    development = cloudflare_d1_database.dev.name
    production  = cloudflare_d1_database.prod.name
  }
}

output "d1_database_ids" {
  description = "Cloudflare D1 database IDs for development and production."
  value = {
    development = cloudflare_d1_database.dev.id
    production  = cloudflare_d1_database.prod.id
  }
}

output "r2_bucket_names" {
  description = "Cloudflare R2 bucket names for product images."
  value = var.enable_r2 ? {
    development = cloudflare_r2_bucket.dev[0].name
    production  = cloudflare_r2_bucket.prod[0].name
  } : null
}

output "worker_and_pages_placeholders" {
  description = "Naming placeholders for CI/CD-managed Cloudflare deployables."
  value = {
    products_worker = local.products_worker_name
    orders_worker   = local.orders_worker_name
    pages_project   = local.pages_project_name
  }
}
