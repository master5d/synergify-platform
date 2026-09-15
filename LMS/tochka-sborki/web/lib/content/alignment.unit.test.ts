import { describe, it, expect } from 'vitest'
import { validateModuleAlignment, selfCheckMarks, type AlignmentInput } from './alignment'

const units = [{ slug: 'u1', title: 'У1' }, { slug: 'u2', title: 'У2' }]
const objectives = [
  { id: 'o1', text: 'Назвать потолок длительности' },
  { id: 'o2', text: 'Выбрать действие при стоп-сигнале' },
  { id: 'o3', text: 'Отличить собеседника от куратора' },
]
const checks = [
  { id: 'c1', unit: 'u1', objective: 'o1', question: 'Сколько?', options: ['10', '60'], answer: 0, explain: 'Потолок — 10.' },
  { id: 'c2', unit: 'u2', objective: 'o2', question: 'Что делать?', options: ['Остановиться', 'Углубиться'], answer: 0, explain: 'Остановиться.' },
  { id: 'c3', unit: 'u2', objective: 'o3', question: 'Кто он?', options: ['Собеседник', 'Терапевт'], answer: 0, explain: 'Собеседник.' },
]

function ok(): AlignmentInput {
  const meta = () => ({ units, objectives: structuredClone(objectives), checks: structuredClone(checks) })
  const marks = () => ({ u1: ['c1'], u2: ['c2', 'c3'] })
  return { slug: 'm', ru: meta(), en: meta(), marks: { ru: marks(), en: marks() }, malformed: { ru: 0, en: 0 } }
}

const errs = (mut: (i: AlignmentInput) => void) => { const i = ok(); mut(i); return validateModuleAlignment(i) }

describe('selfCheckMarks', () => {
  it('collects strict marks and counts malformed ones', () => {
    const r = selfCheckMarks('a <SelfCheck id="c1"/> b <SelfCheck id="c2" /> c <SelfCheck  question="x"/>')
    expect(r.ids).toEqual(['c1', 'c2'])
    expect(r.malformed).toBe(1)
  })
  it('ignores marks inside fenced code and MDX comments', () => {
    const src = 'a <SelfCheck id="c1"/>\n```mdx\n<SelfCheck id="c8"/>\n<SelfCheck q="x"/>\n```\n{/* <SelfCheck id="c9"/> */}\nb'
    const r = selfCheckMarks(src)
    expect(r.ids).toEqual(['c1'])
    expect(r.malformed).toBe(0)
  })
})

describe('validateModuleAlignment', () => {
  it('a consistent module has no errors', () => {
    expect(validateModuleAlignment(ok())).toEqual([])
  })
  it('rule 1: objective count, duplicate id, placeholder text', () => {
    expect(errs(i => { i.ru.objectives = i.ru.objectives!.slice(0, 2) }).join()).toMatch(/3–5/)
    expect(errs(i => { i.ru.objectives![1].id = 'o1' }).join()).toMatch(/повтор/)
    expect(errs(i => { i.ru.objectives![0].text = 'TODO' }).join()).toMatch(/заглушка/)
    expect(errs(i => { delete i.ru.objectives }).join()).toMatch(/3–5/)
  })
  it('rule 2: check refs, options, answer, placeholders', () => {
    expect(errs(i => { i.ru.checks![0].objective = 'o9' }).join()).toMatch(/цель o9/)
    expect(errs(i => { i.ru.checks![0].unit = 'u9' }).join()).toMatch(/урок u9/)
    expect(errs(i => { i.ru.checks![0].options = ['один'] }).join()).toMatch(/2–5/)
    expect(errs(i => { i.ru.checks![0].answer = 2 }).join()).toMatch(/answer/)
    expect(errs(i => { i.ru.checks![0].explain = '…' }).join()).toMatch(/заглушка/)
    expect(errs(i => { i.ru.checks![0].explain = 'TODO: дописать' }).join()).toMatch(/заглушка/)
    expect(errs(i => { i.ru.checks![0].explain = 'Объяснение. TODO.' }).join()).toMatch(/заглушка/)
    expect(errs(i => { i.ru.checks![0].explain = 'Закрытые задачи — в TODO.md' })).toEqual([])
    expect(errs(i => { i.ru.checks![0].options = ['В TODO.md', 'В CLAUDE.md'] })).toEqual([])
    expect(errs(i => { i.ru.checks![1].id = 'c1' }).join()).toMatch(/повтор/)
  })
  it('rule 3: objective without a check', () => {
    expect(errs(i => { i.ru.checks = i.ru.checks!.filter(c => c.objective !== 'o3'); i.marks.ru.u2 = ['c2'] }).join())
      .toMatch(/o3.*нет ни одного вопроса/)
  })
  it('rule 4: marks match checks', () => {
    expect(errs(i => { i.marks.ru.u1 = [] }).join()).toMatch(/c1.*не размечен/)
    expect(errs(i => { i.marks.ru.u1 = ['c1', 'c1'] }).join()).toMatch(/c1.*2 раза/)
    expect(errs(i => { i.marks.ru.u1 = []; i.marks.ru.u2 = ['c2', 'c3', 'c1'] }).join()).toMatch(/c1.*не в своём уроке/)
    expect(errs(i => { i.marks.ru.u1 = ['c1', 'c7'] }).join()).toMatch(/c7.*неизвестн/)
    expect(errs(i => { i.malformed.ru = 1 }).join()).toMatch(/неверный вид/)
  })
  it('rule 5: RU/EN parity', () => {
    expect(errs(i => { i.en.objectives!.push({ id: 'o4', text: 'Лишняя' }) }).join()).toMatch(/RU и EN.*цел/)
    expect(errs(i => { i.en.checks![0].answer = 1 }).join()).toMatch(/c1.*RU и EN/)
    expect(errs(i => { i.en.checks!.pop(); i.marks.en.u2 = ['c2'] }).join()).toMatch(/RU и EN.*вопрос/)
    expect(errs(i => { i.en.checks![0].objective = 'o2' }).join()).toMatch(/c1.*RU и EN/)
    expect(errs(i => { i.en.checks![0].unit = 'u2'; i.marks.en.u1 = []; i.marks.en.u2 = ['c1', 'c2', 'c3'] }).join()).toMatch(/c1.*RU и EN/)
  })
})
