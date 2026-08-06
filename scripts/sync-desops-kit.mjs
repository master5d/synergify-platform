#!/usr/bin/env node
// Sync the @desops/ui-kit source from its home in NAUTILUS into vendor/.
// Source of truth stays in NAUTILUS/core/desops/ui-kit; this copies the
// consumable source (no node_modules, no lockfile) so CI's `npm ci` in hub/
// can resolve the file: dependency inside the repo clone.
// Usage: node scripts/sync-desops-kit.mjs
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(repoRoot, '..', 'NAUTILUS', 'core', 'desops', 'ui-kit')
// Inside hub/ so Node/Turbopack module resolution from the vendored source
// walks up into hub/node_modules, where npm installs the kit's dependencies.
const dest = join(repoRoot, 'hub', 'vendor', 'desops-ui-kit')

if (!existsSync(src)) {
  console.error(`source kit not found: ${src}`)
  process.exit(1)
}

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })

const ENTRIES = [
  'components',
  'hooks',
  'lib',
  'index.ts',
  'globals.css',
  'tailwind-theme.ts',
  'tailwind.config.ts',
  'package.json',
]

for (const entry of ENTRIES) {
  const from = join(src, entry)
  if (!existsSync(from)) {
    console.warn(`skip (missing in source): ${entry}`)
    continue
  }
  cpSync(from, join(dest, entry), { recursive: true })
  console.log(`synced ${entry}`)
}

console.log(`\nhub/vendor/desops-ui-kit refreshed from ${src}`)
