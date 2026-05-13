import { readFileSync } from 'node:fs'

const [, , inputPath] = process.argv

if (!inputPath) {
  console.error('Usage: node scripts/extract-workers-url.mjs <deploy-log-path>')
  process.exit(1)
}

const content = readFileSync(inputPath, 'utf8')
const match = content.match(/https:\/\/[A-Za-z0-9.-]+\.workers\.dev\b/)

if (!match) {
  console.error('Failed to locate a workers.dev URL in the deploy output')
  process.exit(1)
}

process.stdout.write(match[0])
