import { describe, expect, it } from 'vitest'
import { getDictionary } from './dictionaries'

const ru = getDictionary('ru')
const en = getDictionary('en')

describe('value-clarity dictionary parity (fb_8423715c58e2)', () => {
  it('chatVsSystem has 4 rows in both locales', () => {
    expect(ru.chatVsSystem.rows).toHaveLength(4)
    expect(en.chatVsSystem.rows).toHaveLength(ru.chatVsSystem.rows.length)
  })

  it('beforeAfter has 3 items in both locales', () => {
    expect(ru.beforeAfter.items).toHaveLength(3)
    expect(en.beforeAfter.items).toHaveLength(ru.beforeAfter.items.length)
  })

  it('dreams has 6 items in both locales', () => {
    expect(ru.dreams.items).toHaveLength(6)
    expect(en.dreams.items).toHaveLength(ru.dreams.items.length)
  })

  it('faq includes the three objection pairs in both locales', () => {
    expect(en.faq.items).toHaveLength(ru.faq.items.length)
    expect(ru.faq.items.map(i => i.q)).toEqual(
      expect.arrayContaining(['Почему не нанять фрилансера?', 'Мой чат и так всё помнит', 'Почему бесплатно? Где подвох?'])
    )
    expect(en.faq.items.map(i => i.q)).toEqual(
      expect.arrayContaining(['Why not just hire a freelancer?', 'My chat already remembers everything', 'Why free? What’s the catch?'])
    )
  })

  it('hero subtitle carries the spine (no jargon)', () => {
    expect(ru.hero.subtitle).toContain('доводит до конца')
    expect(en.hero.subtitle).toContain('carries to the finish')
    for (const s of [ru.hero.subtitle, en.hero.subtitle]) {
      expect(s).not.toMatch(/MCP|agentic|оркестрац|orchestrat/i)
    }
  })
})

/**
 * Блок «Для кого» описывает СТАДИИ пути, а не мотивы: где человек сейчас
 * находится, а не почему он пришёл. Рамка взята из чужого исследования
 * аудитории ИИ-каналов — но только рамка: цифры оттуда в курс не переносились,
 * потому что в источнике нет ни автора, ни ссылки на само исследование, а
 * модуль 0 учит проверять источник по автору и дате.
 */
describe('«Для кого» — стадии пути', () => {
  for (const locale of ['ru', 'en'] as const) {
    const t = getDictionary(locale)

    it(`${locale}: четыре стадии, каждая с внятным описанием`, () => {
      expect(t.forWho).toHaveLength(4)
      for (const item of t.forWho) {
        expect(item.title.length).toBeGreaterThan(10)
        expect(item.body.length, `${item.title}: описание слишком куцее`).toBeGreaterThan(80)
      }
    })

    it(`${locale}: ядро аудитории названо — «понимаю зачем, не знаю как»`, () => {
      const bodies = t.forWho.map((i) => `${i.title} ${i.body}`).join(' ').toLowerCase()
      expect(bodies).toMatch(/не знаешь как|know why, not how/)
      expect(bodies, 'нет метафоры ступеньки между чтением и делом').toMatch(/ступеньк\w*|a step is missing/)
    })

    it(`${locale}: стадия «упёрся в доступ» не забыта`, () => {
      // Этого сегмента нет в западных моделях, а у курса под него есть
      // отдельный маршрут: cloud-relay и суверенный стек.
      const bodies = t.forWho.map((i) => `${i.title} ${i.body}`).join(' ').toLowerCase()
      expect(bodies).toMatch(/доступ|access/)
      expect(bodies).toMatch(/cloud-relay|cloud relay/)
    })

    it(`${locale}: в блоке нет чужих цифр`, () => {
      // Проценты из неатрибутированного исследования сюда попасть не должны.
      const bodies = t.forWho.map((i) => i.body).join(' ')
      expect(bodies, 'появился процент из чужих данных').not.toMatch(/\d+\s*%/)
    })
  }
})
