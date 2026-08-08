import path from 'node:path'
import type { NextConfig } from 'next'

// Активный pack материализуется в packs/_active скриптом scripts/select-pack.mjs
// (npm prebuild/pretest). Причина: подпути `@pack/...` резолвятся через tsconfig
// paths, а он статичен — ни turbopack.resolveAlias, ни webpack-алиас его для
// подпутей не перебивают. Пока этого не было, COURSE_PACK подменял только контент
// (fs-путь), а словари и конфиг молча приезжали от дефолтного курса.
const PACK_DIR = path.join(__dirname, 'packs', '_active')

// Путевой роутинг: курс может жить не в корне домена, а в подпути школы
// (academy.synergify.com/praktika). Пусто = как раньше, корень домена.
// ⚠ Сырые ссылки на public-ассеты («/author.jpg») basePath НЕ переписывает —
// для них есть assetPath() в lib/base-path.ts.
const BASE_PATH = (process.env.COURSE_BASE_PATH ?? '').replace(/\/$/, '')

const config: NextConfig = {
  output: 'export',
  ...(BASE_PATH ? { basePath: BASE_PATH, assetPrefix: BASE_PATH } : {}),
  // Тот же префикс — клиентскому коду (lib/base-path.ts) для сырых ссылок на public/.
  env: {
    NEXT_PUBLIC_COURSE_BASE_PATH: BASE_PATH,
    // Хост platform-API: переопределяется на стенде, чтобы гейт можно было проверить локально.
    NEXT_PUBLIC_PLATFORM_API: process.env.PLATFORM_API ?? 'https://ai.synergify.com',
  },
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
