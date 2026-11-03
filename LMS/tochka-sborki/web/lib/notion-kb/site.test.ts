import { describe, it, expect } from 'vitest'
import { buildSite, fakeResolver } from './site'
import { MINI_COURSE } from './__fixtures__/mini-course'

const pages = buildSite(MINI_COURSE)
const byKey = new Map(pages.map((p) => [p.key, p]))
const links = fakeResolver(pages)
const url = (k: string) => links.page(k)!
const md = (k: string, l = links) => byKey.get(k)!.markdown(l)
const H = 'https://ai.synergify.com'

describe('buildSite', () => {
  it('дерево: родители, родитель раньше ребёнка, стадии', () => {
    expect(byKey.get('root')!.parentKey).toBeNull()
    expect(byKey.get('en/home')!.parentKey).toBe('root')
    expect(byKey.get('ru/book')!.parentKey).toBe('root')
    expect(byKey.get('en/book')!.parentKey).toBe('en/home')
    expect(byKey.get('ru/u/01-alpha/u2-deep')!.parentKey).toBe('ru/m/01-alpha')
    expect(byKey.get('ru/c/state-md')!.parentKey).toBe('ru/dict')
    expect(byKey.get('en/p/roadmap')!.parentKey).toBe('en/home')
    const seen = new Set<string>()
    for (const p of pages) { if (p.parentKey) expect(seen.has(p.parentKey)).toBe(true); seen.add(p.key) }
    expect(pages.filter((p) => p.stage === 'concept').map((p) => p.key).sort()).toEqual(['en/c/agent', 'en/c/state-md', 'ru/c/agent', 'ru/c/state-md'])
  })
  it('у каждой страницы тег каждого ребёнка — ровно один раз', () => {
    for (const p of pages) for (const c of pages.filter((x) => x.parentKey === p.key)) expect(md(p.key).split(`<page url="${url(c.key)}"`).length - 1).toBe(1)
  })
  it('стартовая: вход для новых, вход для участников, язык, автор, без тихого приглашения', () => {
    const r = md('root')
    expect(r).toContain('<callout icon="👋">\n**Впервые здесь?**')
    expect(r).toContain(`(${H}/?utm_source=notion-kb)`)
    expect(r).toContain(`<page url="${url('ru/book')}">Модули</page>`)
    expect(r).toContain(`<page url="${url('ru/dict')}">Словарь А–Я</page>`)
    expect(r).toContain(`<page url="${url('en/home')}">Tochka Sborki — knowledge base</page>`)
    expect(r).toContain('Написать автору: [Telegram](https://t.me/ku_shaman) · [LinkedIn](https://www.linkedin.com/in/sashamamaev/)')
    expect(r).not.toContain('Курс бесплатный —')
  })
  it('модуль: длительность, цели, юниты в порядке _meta', () => {
    const m = md('ru/m/01-alpha')
    expect(m).toContain('Длительность: 30 мин')
    expect(m).toContain('- Понять память')
    expect(m.indexOf('>Старт</page>')).toBeLessThan(m.indexOf('>Глубже</page>'))
  })
  it('модуль: имена файлов в описании и целях идут inline-кодом, иначе Notion линкует их как адреса', () => {
    const [first, ...rest] = MINI_COURSE.modules.ru
    const course = { ...MINI_COURSE, modules: { ...MINI_COURSE.modules, ru: [{ ...first, description: 'Первый модуль: STATE.md', objectives: [{ id: 'o1', text: 'Храни память в AGENTS.md и ~/.claude/CLAUDE.md' }] }, ...rest] } }
    const built = buildSite(course)
    const page = built.find((p) => p.key === 'ru/m/01-alpha')!.markdown(fakeResolver(built))
    expect(page).toContain('Первый модуль: `STATE.md`')
    expect(page).toContain('- Храни память в `AGENTS.md` и `~/.claude/CLAUDE.md`')
  })
  it('юнит: оглавление, «←» через границу модуля, юнит на сайте, тихое приглашение', () => {
    const u = md('ru/u/02-beta/u1-next')
    expect(u.startsWith('<table-of-contents />')).toBe(true)
    expect(u).toContain(`← [01 · Глубже](${url('ru/u/01-alpha/u2-deep')})`)
    expect(u).toContain(`[Этот юнит на сайте →](${H}/lessons/02-beta/u1-next/?utm_source=notion-kb)`)
    expect(u).toContain(`Курс бесплатный — [начать на сайте →](${H}/?utm_source=notion-kb)`)
  })
  it('словарь: в RU кириллица раньше латиницы', () => {
    const d = md('ru/dict')
    expect(d.indexOf('### А')).toBeLessThan(d.indexOf('### S'))
  })
  it('понятие: цитата, «Подробно» с якорем и без, «Рядом», «Встречается» по модулям', () => {
    const anchored = { ...links, anchor: (l: string, id: string) => (l === 'ru' && id === 'state-md' ? 'b10c-k1d' : null) }
    const c = md('ru/c/state-md', anchored)
    expect(c).toContain('> `STATE.md` — файл, где агент записывает, где остановился.')
    expect(c).toContain(`**Подробно:** [01 · Глубже → «STATE.md — где остановились»](${url('ru/u/01-alpha/u2-deep')}#b10ck1d)`)
    expect(c).toContain(`**Рядом:** [агент](${url('ru/c/agent')})`)
    expect(c).toContain(`- **02 · Бета:** [Дальше](${url('ru/u/02-beta/u1-next')})`)
    expect(md('ru/c/state-md')).toContain(`→ «STATE.md — где остановились»](${url('ru/u/01-alpha/u2-deep')})`)
  })
  it('only: чужой модуль не строится, ссылки на него — на сайт с utm, словарь целиком', () => {
    const sub = buildSite({ ...MINI_COURSE, only: '01-alpha' })
    expect(sub.map((p) => p.key)).not.toContain('ru/m/02-beta')
    expect(sub.map((p) => p.key)).toContain('ru/c/state-md')
    const u = sub.find((p) => p.key === 'ru/u/01-alpha/u1-start')!.markdown(fakeResolver(sub))
    expect(u).toContain(`(${H}/lessons/02-beta/u1-next/?utm_source=notion-kb)`)
  })
  it('EN-страницы не ссылаются на RU-дерево', () => {
    const ruUrls = pages.filter((p) => p.key.startsWith('ru/')).map((p) => url(p.key))
    for (const p of pages.filter((q) => q.key.startsWith('en/'))) for (const u of ruUrls) expect(md(p.key)).not.toContain(u)
  })
  it('одинаковые заголовки у соседей — ошибка (страницу не найти по заголовку)', () => {
    const m = MINI_COURSE.modules.ru[0]
    const dup = { ...MINI_COURSE, modules: { ...MINI_COURSE.modules, ru: [{ ...m, units: [m.units[0], { ...m.units[1], title: m.units[0].title }] }, ...MINI_COURSE.modules.ru.slice(1)] } }
    expect(() => buildSite(dup)).toThrow(/Старт/)
  })
  it('ссылки курса в теле юнита и в дорожной карте ведут на страницы базы (RU и EN)', () => {
    expect(md('ru/u/01-alpha/u1-start')).toContain(`(${url('ru/u/02-beta/u1-next')})`)
    expect(md('en/u/01-alpha/u1-start')).toContain(`(${url('en/u/02-beta/u1-next')})`)
    expect(md('ru/u/02-beta/u1-next')).toContain(`[модуль 01](${url('ru/u/01-alpha/u2-deep')})`)
    expect(md('en/u/02-beta/u1-next')).toContain(`[module 01](${url('en/u/01-alpha/u2-deep')})`)
    expect(md('ru/p/roadmap')).toContain(`(${url('ru/m/01-alpha')})`)
    expect(md('en/p/roadmap')).toContain(`(${url('en/m/01-alpha')})`)
  })
  it('юнита-источника нет — ошибка с id понятия и юнитом', () => {
    const concepts = MINI_COURSE.concepts.map((c) => (c.id === 'state-md' ? { ...c, source: { ...c.source, unit: '01-alpha/u9-none' } } : c))
    expect(() => buildSite({ ...MINI_COURSE, concepts })).toThrow(/state-md.*u9-none/)
  })
  it('«Встречается» — без юнита-источника', () => {
    expect(md('ru/c/state-md')).not.toContain('- **01 · Альфа:**')
    expect(md('ru/c/agent')).toContain(`- **01 · Альфа:** [Глубже](${url('ru/u/01-alpha/u2-deep')})`)
  })
  it('приглашение страницы ведёт на стартовую её языка: EN — /en/, RU — корень', () => {
    expect(md('en/u/02-beta/u1-next')).toContain(`The course is free — [start on the site →](${H}/en/?utm_source=notion-kb)`)
    expect(md('en/book')).toContain(`The course is free — [start on the site →](${H}/en/?utm_source=notion-kb)`)
    expect(md('en/c/agent')).not.toContain(`(${H}/?utm_source=notion-kb)`)
    expect(md('ru/book')).toContain(`Курс бесплатный — [начать на сайте →](${H}/?utm_source=notion-kb)`)
  })
  it('в теле стартовых и книг нет отдельной строки с заголовком страницы', () => {
    for (const key of ['root', 'en/home', 'ru/book', 'en/book']) expect(md(key).split('\n')).not.toContain(byKey.get(key)!.title)
  })
  it('словарь: цифры и символы — одна группа otherSymbols после букв, в RU и EN', () => {
    const extra = (id: string, ru: string, en: string) => ({ ...MINI_COURSE.concepts[0], id, term: { ru, en } })
    const sub = buildSite({ ...MINI_COURSE, concepts: [...MINI_COURSE.concepts, extra('clear', '/clear', '/clear'), extra('d3', '3D', '3D')] })
    const resolver = fakeResolver(sub)
    for (const [key, title] of [['ru/dict', '0–9 и символы'], ['en/dict', '0–9 & symbols']]) {
      const d = sub.find((p) => p.key === key)!.markdown(resolver)
      const headings = d.split('\n').filter((l) => l.startsWith('### '))
      expect(headings[headings.length - 1]).toBe(`### ${title}`)
      expect(headings).toHaveLength(3)
      expect(d.indexOf('>/clear</page>')).toBeGreaterThan(d.indexOf(`### ${title}`))
      expect(d.indexOf('>3D</page>')).toBeGreaterThan(d.indexOf(`### ${title}`))
    }
  })
  it('«Встречается» читает юниты один раз на язык, а не на каждую страницу понятия', () => {
    let reads = 0
    const counted = { ...MINI_COURSE, unitMdx: (...args: Parameters<typeof MINI_COURSE.unitMdx>) => { reads++; return MINI_COURSE.unitMdx(...args) } }
    const sub = buildSite(counted)
    const resolver = fakeResolver(sub)
    for (let pass = 0; pass < 2; pass++) for (const p of sub.filter((x) => x.stage === 'concept')) p.markdown(resolver)
    expect(reads).toBe(8)
  })
})
