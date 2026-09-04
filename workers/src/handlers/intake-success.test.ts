import { describe, it, expect, vi } from 'vitest'
import { handleSubmit } from './intake'
import type { LlmEnv } from '../lib/llm-client'

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
