import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { WORLD_SKINS } from '../src/types.js'

const WORKER_SKIN_LINE = '../../workers/src/lib/gemini.ts'

describe('сверка с оригиналом в воркере', () => {
  it('перечень скинов совпадает со списком в classifyFilmSkin', () => {
    const p = new URL(WORKER_SKIN_LINE, import.meta.url)
    const src = existsSync(p) ? readFileSync(p, 'utf8') : null
    if (src === null) {
      console.warn('SKIP: workers/src/lib/gemini.ts отсутствует — оригинал переехал в сервис')
      return
    }
    const m = src.match(/const skins = '([^']+)'/)
    if (!m) {
      console.warn('SKIP: строка `const skins` в gemini.ts не найдена — classifyFilmSkin переехал в сервис')
      return
    }
    expect(m[1].split('|').sort()).toEqual([...WORLD_SKINS].sort())
  })
})
