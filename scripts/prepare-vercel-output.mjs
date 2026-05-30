#!/usr/bin/env node
/**
 * prepare-vercel-output.mjs
 *
 * Generates `.vercel/output/config.json` with SPA rewrites for Vercel,
 * then copies the Vite build output into `.vercel/output/static/`.
 *
 * Usage:
 *   1. npm run build          (vite build → dist/)
 *   2. node scripts/prepare-vercel-output.mjs
 *   3. npx vercel deploy --prebuilt --prod --token $VERCEL_TOKEN
 *
 * Why: Vercel's auto-generated Vite middleware breaks SPA routing on
 * certain accounts. This bypasses the middleware entirely by writing the
 * route rules directly into the Build Output API v3 config.
 */

import { mkdirSync, copyFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const OUTPUT = join(ROOT, '.vercel', 'output')
const STATIC = join(OUTPUT, 'static')
const CONFIG = join(OUTPUT, 'config.json')

// 1. Ensure dist/ exists
try { statSync(DIST) } catch {
  console.error('❌ dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

// 2. Create output directories
mkdirSync(STATIC, { recursive: true })

// 3. Write config.json with SPA rewrites
const config = {
  version: 3,
  routes: [
    { src: '/(.*)', dest: '/index.html' },
  ],
}
writeFileSync(CONFIG, JSON.stringify(config, null, 2))
console.log('✅ .vercel/output/config.json written')

// 4. Copy dist/ → .vercel/output/static/
function copyRecursive(src, dest) {
  const entries = readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true })
      copyRecursive(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

copyRecursive(DIST, STATIC)
console.log(`✅ dist/ → .vercel/output/static/ (${readdirSync(STATIC, { recursive: true }).length} files)`)

// 5. Summary
console.log('\n📦 Ready for Vercel prebuilt deployment!')
console.log('   Run: npx vercel deploy --prebuilt --prod --token $VERCEL_TOKEN\n')
