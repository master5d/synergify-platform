import path from 'node:path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Repo root, so Turbopack accepts the LMS/registry.json import from outside web/.
  turbopack: {
    root: path.join(__dirname, '../../..'),
    // @pack = активный course-pack; переключается COURSE_PACK (Ф1 S4).
    resolveAlias: { '@pack': `./packs/${process.env.COURSE_PACK ?? 'tochka-sborki'}` },
  },
}

export default config
