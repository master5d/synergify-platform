import { describe, expect, it } from 'vitest'
import { fromBase64Url } from '../retreat-calc/link'
import { toCsv } from '../retreat-core/csv'
import { decodeToolLink } from '../retreat-core/tool-link'
import { pickMenuTool } from '../retreat-menu/form'
import { timelineHash, defaultForm as timelineDefault } from '../retreat-timeline/form'
import { matchColumns, readAnswers, summarize } from './answers'
import {
  defaultForm, draftOf, formFromDecoded, formFromDraft, formHash, formHashFromPassport, menuHashWithDiets, pickFormTool, type GuestFormState,
} from './form'
import { DEFAULT_ON, QUESTIONS } from './questions'

const TODAY = '2027-01-15'
const PASSPORT = { title: 'Неделя в горах', currency: 'USD', start: '2027-05-10', nights: 6, guests: 16 }
const decoded = (hash: string) => fromBase64Url(hash.replace(/^#data=/, ''))

// ответы с именами и телефонами: ни одно из этих значений не должно попасть в ссылку или черновик
const SECRETS = ['Анна Кольцова', '+7 000 111-22-33', 'Мама, +7 000 444-55-66', 'астма']
const ANSWERS = toCsv([
  QUESTIONS.map((q) => q.text.ru),
  QUESTIONS.map((q) => ({ name: SECRETS[0], phone: SECRETS[1], emergency: SECRETS[2], breathingLimits: SECRETS[3], diet: 'веган' } as Record<string, string>)[q.id] ?? ''),
], 'ru')

describe('ссылка анкеты в меню', () => {
  it('диета «веган без глютена» уходит в меню своим ключом', () => {
    const text = decoded(menuHashWithDiets(PASSPORT, { 'vegan-gluten-free': 2 }))
    const raw = (typeof text === 'string' ? JSON.parse(text) : text) as { tool: { diets: Record<string, number> } }
    expect(raw.tool.diets['vegan-gluten-free']).toBe(2)
  })
})

describe('ссылка и черновик анкеты', () => {
  it('круг ссылки: паспорт и набор вопросов', () => {
    const f: GuestFormState = { passport: PASSPORT, on: ['name', 'diet', 'touch'] }
    const back = formFromDecoded(decodeToolLink(formHash(f), pickFormTool, 'ru'), TODAY)
    expect(back?.on).toEqual(['name', 'diet', 'touch'])
    expect(back?.passport).toMatchObject(PASSPORT)
  })
  it('allowlist: чужие ключи отбрасываются, имя добавляется', () => {
    expect(pickFormTool({ on: ['diet'], answers: [['Анна']], guests: ['Анна'] })).toEqual({ on: ['name', 'diet'] })
    expect(pickFormTool(null)).toEqual({ on: DEFAULT_ON })
  })
  it('после загрузки ответов ни ссылка, ни черновик, ни ссылка в меню не несут данных гостей', () => {
    const t = readAnswers(ANSWERS)
    const s = summarize(t, matchColumns(t.header, DEFAULT_ON), DEFAULT_ON, PASSPORT.guests)
    expect(s.guests).toHaveLength(1)
    const f: GuestFormState = { ...defaultForm(TODAY), passport: PASSPORT }
    const menu = menuHashWithDiets(f.passport, s.diets)
    for (const out of [decoded(formHash(f)), draftOf(f), decoded(menu)]) {
      for (const secret of SECRETS) expect(out).not.toContain(secret)
    }
    expect(decodeToolLink(menu, pickMenuTool, 'ru')).toMatchObject({ ok: true, link: { tool: { grid: {}, diets: { vegan: 1, vegetarian: 0, 'gluten-free': 0 } } } })
    // посчитать нечего — особые диеты всё равно нулями: старые числа черновика меню не подставятся
    expect(decodeToolLink(menuHashWithDiets(f.passport, {}), pickMenuTool, 'ru')).toMatchObject({ link: { tool: { diets: { vegetarian: 0, vegan: 0, 'gluten-free': 0 } } } })
  })
  it('черновик читается обратно; мусор — null', () => {
    const f: GuestFormState = { passport: PASSPORT, on: ['name', 'photo'] }
    expect(formFromDraft(draftOf(f), TODAY)).toEqual(formFromDecoded(decodeToolLink(formHash(f), pickFormTool, 'ru'), TODAY))
    expect(formFromDraft('{', TODAY)).toBeNull()
  })
  it('ссылка таймлайна и ссылка с паспортом открывают анкету со всеми вопросами', () => {
    const tl = timelineHash({ ...timelineDefault(TODAY), passport: PASSPORT })
    expect(formFromDecoded(decodeToolLink(tl, pickFormTool, 'ru'), TODAY)).toMatchObject({ passport: PASSPORT, on: DEFAULT_ON })
    expect(formFromDecoded(decodeToolLink(formHashFromPassport(PASSPORT), pickFormTool, 'en'), TODAY)?.on).toEqual(DEFAULT_ON)
  })
})
