import { describe, expect, it } from 'vitest'
import { answersCsvHeader, answersTemplateCsv, DEFAULT_ON, formText, normalizeOn, QUESTIONS, SECTION_TITLE, SECTION_WHY } from './questions'

const LANGS = ['ru', 'en'] as const
const sentences = (t: string) => t.split(/(?<=[.!?])\s+/).filter(Boolean)

describe('каталог вопросов анкеты', () => {
  it('у каждого вопроса есть текст и заголовок колонки на обоих языках, у вариантов — подписи', () => {
    for (const q of QUESTIONS) {
      for (const lang of LANGS) {
        expect(q.text[lang].trim().length).toBeGreaterThan(0)
        expect(q.short[lang].trim().length).toBeGreaterThan(0)
      }
      if (q.kind === 'choice') {
        expect(q.choices?.length).toBeGreaterThan(1)
        for (const c of q.choices!) for (const lang of LANGS) expect(q.choiceText?.[c]?.[lang]?.trim().length).toBeGreaterThan(0)
      }
    }
  })
  it('фразы вопросов и пояснений короче 25 слов', () => {
    const texts = [...QUESTIONS.flatMap((q) => LANGS.map((l) => q.text[l])), ...Object.values(SECTION_WHY).flatMap((w) => LANGS.map((l) => w![l]))]
    for (const t of texts) for (const s of sentences(t)) expect(s.split(/\s+/).length).toBeLessThan(25)
  })
  it('заголовки колонок уникальны в языке', () => {
    for (const lang of LANGS) expect(new Set(QUESTIONS.map((q) => q.short[lang])).size).toBe(QUESTIONS.length)
  })
  it('normalizeOn: только известные id, без повторов, в порядке анкеты, имя всегда', () => {
    expect(normalizeOn(['photo', 'xxx', 'photo', 'diet'])).toEqual(['name', 'diet', 'photo'])
    expect(normalizeOn(null)).toEqual(['name'])
    expect(normalizeOn(DEFAULT_ON)).toEqual(QUESTIONS.map((q) => q.id))
  })
})

describe('текст анкеты для чужого сервиса', () => {
  it('без раздела здоровья нет ни его заголовка, ни пояснения', () => {
    const on = DEFAULT_ON.filter((id) => !['loadLimits', 'breathingLimits', 'touch'].includes(id))
    for (const lang of LANGS) {
      const t = formText(on, lang)
      expect(t).not.toContain(SECTION_TITLE.health[lang])
      expect(t).not.toContain(SECTION_WHY.health![lang])
    }
    expect(formText(DEFAULT_ON, 'ru')).toContain(SECTION_WHY.health!.ru)
  })
  it('нумерация сквозная и без пропусков, когда вопросы в середине выключены', () => {
    const on = DEFAULT_ON.filter((id) => !['flightIn', 'timeIn', 'allergies'].includes(id))
    const nums = formText(on, 'en').split('\n').map((l) => /^(\d+)\. /.exec(l)?.[1]).filter(Boolean).map(Number)
    expect(nums).toEqual(Array.from({ length: on.length }, (_, i) => i + 1))
  })
  it('у вопроса с вариантами варианты в скобках; заголовок — название ретрита', () => {
    const t = formText(['diet'], 'ru', 'Неделя в горах')
    expect(t.startsWith('Неделя в горах\n')).toBe(true)
    expect(t).toContain('2. Как вы едите (всё / без мяса и рыбы / веган / без глютена / веган без глютена / другое)')
  })
})

describe('шаблон CSV ответов', () => {
  it('заголовки — короткие подписи включённых вопросов по порядку; файл с BOM', () => {
    expect(answersCsvHeader(DEFAULT_ON, 'ru')).toEqual(QUESTIONS.map((q) => q.short.ru))
    expect(answersCsvHeader(['diet'], 'en')).toEqual(['Guest', 'Diet'])
    expect(answersTemplateCsv(DEFAULT_ON, 'ru').startsWith('\uFEFF')).toBe(true)
  })
})
