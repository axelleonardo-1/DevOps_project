import { writeFileSync } from 'node:fs'

const [, , service, environment, outputPath] = process.argv

if (!service || !environment || !outputPath) {
  console.error('Usage: node scripts/render-wrangler-config.mjs <products|orders> <dev|production> <output-path>')
  process.exit(1)
}

if (!['products', 'orders'].includes(service)) {
  console.error(`Unsupported service: ${service}`)
  process.exit(1)
}

if (!['dev', 'production'].includes(environment)) {
  console.error(`Unsupported environment: ${environment}`)
  process.exit(1)
}

const d1DatabaseId = process.env.D1_DATABASE_ID?.trim()
const d1DatabaseName = process.env.D1_DATABASE_NAME?.trim()

if (!d1DatabaseId || !d1DatabaseName) {
  console.error('D1_DATABASE_ID and D1_DATABASE_NAME are required')
  process.exit(1)
}

const escapeToml = (value) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const workerName = service === 'products' ? 'products-service' : 'orders-service'
const envWorkerName = `${workerName}-${environment === 'dev' ? 'dev' : 'prod'}`
const appVersion = environment === 'dev' ? '2.0.0-dev' : '2.0.0'

const lines = [
  `name = "${workerName}"`,
  'main = "src/index.js"',
  'compatibility_date = "2026-05-06"',
  '',
  `[env.${environment}]`,
  `name = "${envWorkerName}"`,
  '',
  `[env.${environment}.vars]`,
  `APP_VERSION = "${appVersion}"`,
]

if (service === 'products') {
  const r2BucketName = process.env.R2_BUCKET_NAME?.trim()

  if (!r2BucketName) {
    console.error('R2_BUCKET_NAME is required for products')
    process.exit(1)
  }

  lines.push('PRODUCTS_STORAGE_DRIVER = "d1"')
  lines.push('MAX_PRODUCT_IMAGE_BYTES = "5242880"')
  lines.push('')
  lines.push(`[[env.${environment}.d1_databases]]`)
  lines.push('binding = "DB"')
  lines.push(`database_name = "${escapeToml(d1DatabaseName)}"`)
  lines.push(`database_id = "${escapeToml(d1DatabaseId)}"`)
  lines.push(`preview_database_id = "${escapeToml(d1DatabaseId)}"`)
  lines.push('migrations_dir = "migrations"')
  lines.push('')
  lines.push(`[[env.${environment}.r2_buckets]]`)
  lines.push('binding = "PRODUCT_IMAGES_BUCKET"')
  lines.push(`bucket_name = "${escapeToml(r2BucketName)}"`)
} else {
  const productsServiceUrl = process.env.PRODUCTS_SERVICE_URL?.trim()

  if (!productsServiceUrl) {
    console.error('PRODUCTS_SERVICE_URL is required for orders')
    process.exit(1)
  }

  lines.push('ORDERS_STORAGE_DRIVER = "d1"')
  lines.push(`PRODUCTS_SERVICE_URL = "${escapeToml(productsServiceUrl)}"`)
  lines.push(`PAYMENT_DELAY_MS = "${environment === 'dev' ? '10' : '25'}"`)
  lines.push('')
  lines.push(`[[env.${environment}.d1_databases]]`)
  lines.push('binding = "DB"')
  lines.push(`database_name = "${escapeToml(d1DatabaseName)}"`)
  lines.push(`database_id = "${escapeToml(d1DatabaseId)}"`)
  lines.push(`preview_database_id = "${escapeToml(d1DatabaseId)}"`)
  lines.push('migrations_dir = "migrations"')
}

writeFileSync(outputPath, `${lines.join('\n')}\n`)
