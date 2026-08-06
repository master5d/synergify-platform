// scripts/merge-blog.mjs
// Model B: fold the standalone blog export into the hub export so the site is
// served as one origin — blog at /blog/* and /en/blog/*. Blog assets live under
// /blog/_next (matches blog next.config assetPrefix), never colliding with hub's
// /_next. Run from the repo root AFTER both apps build, BEFORE wrangler deploy.
import { cp, access } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const blogOut = join(root, 'blog', 'out')
const hubOut = join(root, 'hub', 'out')

async function exists(p) { try { await access(p); return true } catch { return false } }

// [from (under blog/out), to (under hub/out)]
const moves = [
  ['blog', 'blog'],
  ['en/blog', 'en/blog'],
  ['_next', 'blog/_next'],
]

for (const [from, to] of moves) {
  const src = join(blogOut, from)
  const dest = join(hubOut, to)
  if (!(await exists(src))) {
    console.error(`merge-blog: missing source ${src} — did the blog build run?`)
    process.exit(1)
  }
  await cp(src, dest, { recursive: true })
  console.log(`merge-blog: blog/out/${from} -> hub/out/${to}`)
}
console.log('merge-blog: done')
