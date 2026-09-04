import { describe, it, expect, vi } from 'vitest'
import { handleSubmit } from './intake'
import type { LlmEnv } from '../lib/llm-client'

// Фикс-раунд 1 (координатор): прежняя версия теста не звала боевой handleSubmit —
// она повторяла try/catch внутри себя же, поэтому не доказывала, что деградация
// действительно зашита в обработчик. Здесь гвард бьёт по-настоящему: реальный
// handleSubmit с фетчем, который всегда отвечает 502, и проверка того, что реально
// легло в БД (а не то, что тест сам себе насчитал).

// Поправка 3 к брифу: имена CF Access — LLM_CF_ACCESS_CLIENT_ID/SECRET, а не
// CF_ACCESS_CLIENT_ID/SECRET — те заняты Listmonk (см. crm.ts), другой service-token.
const LLM_ENV: LlmEnv = { LLM_SERVICE_URL: 'https://x', LLM_SERVICE_TOKEN: 't',
  LLM_CF_ACCESS_CLIENT_ID: 'i', LLM_CF_ACCESS_CLIENT_SECRET: 's' }

// Приём взят из src/handlers/intake.test.ts (fakeDbV2) — тот же мок D1, не свой.
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

// Бинды основного INSERT INTO intake_profiles (см. intake.ts) идут в этом порядке —
// нулевой индекс user_id, дальше по списку колонок из VALUES.
const BIND = {
  worldSkin: 12,
  legendaryTitle: 20,
  backstory: 21,
  firstQuest: 22,
  finalBoss: 23,
  proseSource: 24,
}

describe('деградация интейка: отказ сервиса не должен ронять сабмит', () => {
  it('при 502 сервиса анкета всё равно собирается, prose_source=template, world_skin не теряется', async () => {
    const db = fakeDb(2)
    const failingFetch = vi.fn().mockResolvedValue({ ok: false, status: 502,
      json: async () => ({ error: { code: 'timeout', message: 'm' } }) })

    const res = await handleSubmit(
      db, 'user1', { answers: { V_NICHE: 'coach', V_SKIN: 'cyber-noir' } }, LLM_ENV, failingFetch as any,
    )

    expect(res.status).toBe(200) // отказ сервиса не должен превратиться в ошибку пользователю
    const insert = db.inserts.find((i: any) => i.sql.startsWith('INSERT INTO intake_profiles'))
    expect(insert).toBeTruthy()
    const binds = insert!.binds
    expect(binds[BIND.proseSource]).toBe('template')
    expect(binds[BIND.legendaryTitle]).toBeTruthy()
    expect(binds[BIND.backstory]).toBeTruthy()
    expect(binds[BIND.firstQuest]).toBeTruthy()
    expect(binds[BIND.finalBoss]).toBeTruthy()
    expect(binds[BIND.worldSkin]).toBeDefined()
    expect(binds[BIND.worldSkin]).not.toBe('undefined')
  })
})
