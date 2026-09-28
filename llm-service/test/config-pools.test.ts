import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { loadEnv } from '../src/config.js'

// Правило лабы: LLM-вызов — только через гейтвей и только по алиасу пула, никогда по
// сырому имени провайдерской модели. Рецидив 2026-09-28: POOL_PROSE и POOL_DEMAND_BRIEF
// по умолчанию были 'google/gemini-3-flash-preview'; заменены на алиас 'prose-pool'.
// Сырое имя провайдера узнаётся по '/' (provider/model), у алиасов пулов слэша нет.
const RAW = { GATEWAY_URL: 'https://gw.example/v1', GATEWAY_API_KEY: 'k', API_TOKEN: 't' }

const looksLikeRawModel = (v: string) => v.includes('/')

function poolDefaults(): Record<string, string> {
  const env = loadEnv(RAW as any) as unknown as Record<string, unknown>
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => k.startsWith('POOL_')).map(([k, v]) => [k, String(v)]),
  )
}

describe('дефолты POOL_* — алиасы пулов, не сырые имена моделей', () => {
  it('прибор видит предмет и узнаёт сырое имя (известный ответ)', () => {
    const pools = poolDefaults()
    expect(Object.keys(pools)).toEqual(expect.arrayContaining(['POOL_PROSE', 'POOL_DEMAND_BRIEF']))
    expect(looksLikeRawModel('google/gemini-3-flash-preview')).toBe(true)
    expect(looksLikeRawModel('prose-pool')).toBe(false)
  })

  it('ни один дефолт POOL_* не содержит "/"', () => {
    const raw = Object.entries(poolDefaults()).filter(([, v]) => looksLikeRawModel(v))
    expect(raw).toEqual([])
  })

  it('проза и брифы по умолчанию идут в prose-pool', () => {
    const pools = poolDefaults()
    expect(pools.POOL_PROSE).toBe('prose-pool')
    expect(pools.POOL_DEMAND_BRIEF).toBe('prose-pool')
  })

  it('.env.example не подсказывает сырое имя модели', () => {
    const lines = readFileSync(new URL('../.env.example', import.meta.url), 'utf8')
      .split(/\r?\n/)
      .filter((l) => /^POOL_[A-Z_]+=/.test(l))
    expect(lines.length).toBeGreaterThan(0)
    const raw = lines.filter((l) => looksLikeRawModel(l.slice(l.indexOf('=') + 1)))
    expect(raw).toEqual([])
  })
})
