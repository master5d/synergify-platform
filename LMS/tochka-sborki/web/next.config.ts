import path from 'node:path'
import type { NextConfig } from 'next'

// Активный pack материализуется в packs/_active скриптом scripts/select-pack.mjs
// (npm prebuild/pretest). Причина: подпути `@pack/...` резолвятся через tsconfig
// paths, а он статичен — ни turbopack.resolveAlias, ни webpack-алиас его для
// подпутей не перебивают. Пока этого не было, COURSE_PACK подменял только контент
// (fs-путь), а словари и конфиг молча приезжали от дефолтного курса.
const PACK_DIR = path.join(__dirname, 'packs', '_active')

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Repo root, so Turbopack accepts the LMS/registry.json import from outside web/.
  turbopack: {
    root: path.join(__dirname, '../../..'),
    resolveAlias: { '@pack': './packs/_active' },
  },
  webpack: (cfg) => {
    cfg.resolve.alias = { ...cfg.resolve.alias, '@pack': PACK_DIR }
    return cfg
  },
}

export default config
