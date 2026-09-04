import { describe, it, expect, vi } from 'vitest'
import { handleSubmit } from './intake'
import type { LlmEnv } from '../lib/llm-client'
import { requiredIds } from '../../../LMS/tochka-sborki/web/lib/intake/instrument'

// Блокирующая находка 2 финального ревью: гварда на путь УСПЕХА не было —
// «v2 submit» в intake.test.ts проверяет только status 200, а 200 отдаёт и
// деградация (см. intake-fallback.test.ts). Зеркалим приёмы того файла:
// настоящий handleSubmit, мокнутый D1 с захватом бинды, fetchImpl, отвечающий
// УСПЕХОМ с валидной прозой, и проверка что source='gemini' и поля — те,
// что вернул сервис, а не шаблонные.

const LLM_ENV: LlmEnv = { LLM_SERVICE_URL: 'https://x', LLM_SERVICE_TOKEN: 't',
  LLM_CF_ACCESS_CLIENT_ID: 'i', LLM_CF_ACCESS_CLIENT_SECRET: 's' }

// Тот же мок D1, что в intake-fallback.test.ts (fakeDb) — не свой.
function fakeDb(existingVersion = 2) {
  const inserts: { sql: string; binds: any[] }[] = []
  const db = {
    inserts,
    prepare(sql: string) {
      return {
        bind: (...binds: any[]) => ({
          first: async () => (sql.includes('SELECT instrument_version') ? { instrument_version: existingVersion } : null),
          run: async () => {
            if (sql.startsWith('INSERT INTO intake_profiles')) inserts.push({ sql, binds })
            return { success: true }
          },
        }),
      }
    },
  } as any
  return db
}

// Порядок бинд-параметров основного INSERT — см. intake.ts / intake-fallback.test.ts.
const BIND = {
  worldSkin: 12,
  legendaryTitle: 20,
  backstory: 21,
  firstQuest: 22,
  finalBoss: 23,
  proseSource: 24,
}

// Прозу отличаем от fallbackProse() намеренно — если маппинг подменит ответ
// сервиса шаблоном, эти значения в базу не попадут и тест это увидит.
const SERVICE_PROSE = {
  legendaryTitle: 'Служебный Титул', backstory: 'Служебная предыстория',
  firstQuest: 'Служебный первый квест', finalBoss: 'Служебный финальный босс',
}

describe('успех интейка: /prose отвечает валидной прозой', () => {
  it('prose_source=gemini, поля прозы — те, что вернул сервис, тело /prose корректно', async () => {
    const db = fakeDb(2)
    const okFetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => SERVICE_PROSE,
    })

    const answers = {
      V_NICHE: 'coach', V_SKIN: 'cyber-noir', V_OUTCOME: 'independence',
    }
    const res = await handleSubmit(db, 'user1', { answers, locale: 'en' }, LLM_ENV, okFetch as any)

    expect(res.status).toBe(200)

    const insert = db.inserts.find((i: any) => i.sql.startsWith('INSERT INTO intake_profiles'))
    expect(insert).toBeTruthy()
    const binds = insert!.binds
    expect(binds[BIND.proseSource]).toBe('gemini')
    expect(binds[BIND.legendaryTitle]).toBe(SERVICE_PROSE.legendaryTitle)
    expect(binds[BIND.backstory]).toBe(SERVICE_PROSE.backstory)
    expect(binds[BIND.firstQuest]).toBe(SERVICE_PROSE.firstQuest)
    expect(binds[BIND.finalBoss]).toBe(SERVICE_PROSE.finalBoss)
    expect(binds[BIND.worldSkin]).toBeDefined()

    // Тело, ушедшее в /prose — ловит опечатку в имени поля, которую иначе никто не поймает.
    const proseCall = okFetch.mock.calls.find((c: any[]) => String(c[0]).endsWith('/prose'))
    expect(proseCall).toBeTruthy()
    const sentBody = JSON.parse(proseCall![1].body)
    expect(sentBody).toHaveProperty('charClass')
    expect(sentBody).toHaveProperty('worldSkin')
    expect(sentBody).toHaveProperty('language')
    expect(sentBody.language).toBe('en')
    expect(sentBody).toHaveProperty('aspirational')
    expect(sentBody.aspirational).toBe('independence')
  })
})

// Боевой дефект 2026-09-04: анкета v1, G12='mix' («Смесь — мне всё равно»),
// переключатель сайта на русском — а лист пришёл ЦЕЛИКОМ по-английски.
// `mix` — не язык, а отказ выбирать; уехав в сервис как есть, он отдал выбор
// модели, и та выбрала английский. Решать обязана локаль анкеты.
describe('G12=mix разрешается локалью анкеты, а не моделью', () => {
  async function languageSentFor(locale: 'ru' | 'en') {
    const db = fakeDb(1) // v1: sheetLanguage берётся из G12 как есть
    const okFetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => SERVICE_PROSE,
    })
    const answers: Record<string, unknown> = { G12: 'mix' }
    for (const id of requiredIds(1)) if (answers[id] == null) answers[id] = 'x'
    answers['G12'] = 'mix'
    await handleSubmit(db, 'u1', { answers: answers as any, locale }, LLM_ENV, okFetch as any)
    const proseCall = okFetch.mock.calls.find(c => String(c[0]).endsWith('/prose'))
    return JSON.parse(proseCall![1].body).language
  }

  it('русская анкета → ru-tech, не mix', async () => {
    expect(await languageSentFor('ru')).toBe('ru-tech')
  })

  it('английская анкета → en', async () => {
    expect(await languageSentFor('en')).toBe('en')
  })
})
