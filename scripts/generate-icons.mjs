import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// Minimal PNG (teal square) - pre-encoded 192x192 and 512x512 placeholders
// These are valid 1x1 teal pixels scaled via manifest (browsers accept for dev)
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

writeFileSync(join(publicDir, 'icon-192.png'), minimalPng)
writeFileSync(join(publicDir, 'icon-512.png'), minimalPng)
console.log('PWA icons generated')