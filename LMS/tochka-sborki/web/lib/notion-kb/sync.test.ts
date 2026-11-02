import { describe, it, expect } from 'vitest'
import { syncSite, verifyRootStamp, stampLine, type SyncOptions } from './sync'
import { MANIFEST_TITLE } from './manifest'
import { buildSite } from './site'
import { MINI_COURSE } from './__fixtures__/mini-course'
import { FakeNotion } from './__fixtures__/fake-notion'
import { pageTag, notionUrl } from './md'
import { NotionError } from './client'
import type { SiteInput } from './types'

const SHA = 'abcdef1234567890abcdef1234567890abcdef12', DATE = '2026-11-02'
const run = (fake: FakeNotion, input: SiteInput = MINI_COURSE, o: Partial<SyncOptions> = {}) =>
  syncSite(fake, buildSite(input), input.concepts, 'svc', { sha: SHA, date: DATE, log: () => {}, ...o })
const N = buildSite(MINI_COURSE).length
const rootTitle = MINI_COURSE.config.title.ru
const withUnit = (m: string, u: string, patch: (src: string) => string, title?: string): SiteInput => ({
  ...MINI_COURSE,
  unitMdx: (l, mm, uu) => (mm === m && uu === u ? patch(MINI_COURSE.unitMdx(l, mm, uu)) : MINI_COURSE.unitMdx(l, mm, uu)),
  modules: title ? { ru: MINI_COURSE.modules.ru.map((x) => (x.slug === m ? { ...x, units: x.units.map((y) => (y.slug === u ? { ...y, title } : y)) } : x)), en: MINI_COURSE.modules.en } : MINI_COURSE.modules,
})

describe('syncSite', () => {
  it('первый прогон: всё дерево, манифест, каждая страница записана, штамп корня сходится', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const rep = await run(fake)
    expect(rep.created).toBe(N)
    expect(fake.live().filter((p) => p.title === MANIFEST_TITLE)).toHaveLength(1)
    expect(await verifyRootStamp(fake, fake.idByTitle(rootTitle), 'abcdef1')).toBe(true)
  })
  it('повторный прогон того же коммита ничего не пишет', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake); fake.log.length = 0
    expect((await run(fake)).unchanged).toBe(N)
    expect(fake.log).toEqual([])
  })
  it('новый коммит без правок курса — переписаны только корень и манифест', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake); fake.log.length = 0
    await run(fake, MINI_COURSE, { sha: '1234567' + SHA.slice(7) })
    expect(fake.log).toEqual([`replace ${fake.idByTitle(rootTitle)}`, `replace ${fake.idByTitle(MANIFEST_TITLE)}`])
  })
  it('переименованный юнит: новый заголовок и переписанный модуль', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake); const id = fake.idByTitle('Глубже'); fake.log.length = 0
    await run(fake, withUnit('01-alpha', 'u2-deep', (s) => s, 'Ещё глубже'))
    expect(fake.log).toContain(`title ${id}`)
    expect(fake.log).toContain(`replace ${fake.idByTitle('01 · Альфа')}`)
  })
  it('убранный юнит уходит в корзину раньше перезаписи модуля', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake); const unit = fake.idByTitle('Запас'), mod = fake.idByTitle('02 · Бета'); fake.log.length = 0
    const m = MINI_COURSE.modules.ru[1]
    await run(fake, { ...MINI_COURSE, modules: { ...MINI_COURSE.modules, ru: [MINI_COURSE.modules.ru[0], { ...m, units: m.units.slice(0, 1) }] } })
    expect(fake.get(unit).inTrash).toBe(true)
    expect(fake.log.indexOf(`trash ${unit}`)).toBeLessThan(fake.log.indexOf(`replace ${mod}`))
  })
  it('504 на создании (uncertain) не плодит дубль', async () => {
    const fake = new FakeNotion({ root: 'svc', uncertainCreates: new Set(['Глубже']) })
    await run(fake)
    expect(fake.live().filter((p) => p.title === 'Глубже')).toHaveLength(1)
  })
  it('uncertain с задержанной видимостью: дубль не создаётся, следующий прогон принимает', async () => {
    const fake = new FakeNotion({ root: 'svc', uncertainCreates: new Set(['Глубже']), hiddenLists: 4 })
    await expect(run(fake, MINI_COURSE, { sleep: async () => {} })).rejects.toThrow(/не подтверждено/)
    expect(fake.live().filter((p) => p.title === 'Глубже')).toHaveLength(1)
    const rep = await run(fake, MINI_COURSE, { sleep: async () => {} })
    expect(fake.live().filter((p) => p.title === 'Глубже')).toHaveLength(1)
    expect(rep.adopted).toBeGreaterThanOrEqual(1)
  })
  it('якорь «Подробно» — id заголовка; новая запись юнита → новый якорь у понятия', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake)
    const concept = () => fake.get(fake.idByTitle('STATE.md')).markdown
    const first = concept().match(/#([0-9a-z]+)\)/)![1]
    await run(fake, withUnit('01-alpha', 'u2-deep', (s) => s + '\n\nНовая строка.'))
    expect(concept().match(/#([0-9a-z]+)\)/)![1]).not.toBe(first)
  })
  it('only: чужой модуль не создаётся, корзины нет; после полного прогона книга сохраняет все теги', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    await run(fake, { ...MINI_COURSE, only: '01-alpha' })
    expect(fake.live().some((p) => p.title === '02 · Бета')).toBe(false)
    await run(fake)
    await expect(run(fake, withUnit('01-alpha', 'u1-start', (s) => s + '\n\nещё', undefined), { only: '01-alpha', sha: 'f00ba12' + SHA.slice(7) })).resolves.toBeDefined()
    expect(fake.log.some((l) => l.startsWith('trash'))).toBe(false)
  })
  it('ручная подстраница останавливает прогон с ключом страницы и ничего не удаляет', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake)
    fake.addManualChild(fake.idByTitle(rootTitle), 'Моя заметка')
    await expect(run(fake, MINI_COURSE, { sha: 'f00ba12' + SHA.slice(7) })).rejects.toThrow(/root/)
    expect(fake.live().some((p) => p.title === 'Моя заметка')).toBe(true)
  })
  it('ручная подстраница под убираемой страницей останавливает прогон до корзины', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake)
    const removed = fake.idByTitle('Глубже')
    fake.addManualChild(removed, 'Моя заметка')
    fake.log.length = 0
    const m = MINI_COURSE.modules.ru[0]
    const input = { ...MINI_COURSE, concepts: MINI_COURSE.concepts.filter((concept) => concept.source.unit !== '01-alpha/u2-deep'), modules: { ...MINI_COURSE.modules, ru: [{ ...m, units: m.units.slice(0, -1) }, ...MINI_COURSE.modules.ru.slice(1)] } }
    await expect(run(fake, input)).rejects.toThrow(/Моя заметка.*ru\/u\/01-alpha\/u2-deep/)
    expect(fake.log.some((line) => line.startsWith('trash '))).toBe(false)
    expect(fake.get(fake.idByTitle('Моя заметка')).inTrash).toBe(false)
  })
  it('битый манифест — ошибка до любой записи', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake)
    fake.setMarkdown(fake.idByTitle(MANIFEST_TITLE), '```\n{oops\n```'); fake.log.length = 0
    await expect(run(fake)).rejects.toThrow(/манифест/)
    expect(fake.log).toEqual([])
  })
  it('каждая живая страница, кроме манифеста, записана и кончается штампом своей локали', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake)
    const stamps = [stampLine('ru', SHA, DATE), stampLine('en', SHA, DATE)]
    const pages = fake.live().filter((p) => p.title !== MANIFEST_TITLE)
    expect(pages).toHaveLength(N)
    for (const p of pages) expect(stamps.some((s) => p.markdown.endsWith(s))).toBe(true)
  })
  it('uncertain-создание засчитано как принятое', async () => {
    const fake = new FakeNotion({ root: 'svc', uncertainCreates: new Set(['Глубже']) })
    const rep = await run(fake)
    expect(rep.adopted).toBe(1)
    expect(rep.created).toBe(N - 1)
  })
  it('оборванный прогон: второй принимает страницы-сироты, дублей нет', async () => {
    const fake = new FakeNotion({ root: 'svc', failAfterCreates: 5 })
    await expect(run(fake)).rejects.toThrow(/обрыв/)
    const rep = await run(fake)
    expect(rep.adopted).toBeGreaterThanOrEqual(1)
    expect(rep.created + rep.adopted).toBe(N)
    const seen = new Set<string>()
    for (const p of fake.live()) {
      const k = `${p.parent} ${p.title}`
      expect(seen.has(k)).toBe(false)
      seen.add(k)
    }
  })
  it('обрыв в шаге создания, затем страница убрана из курса: следующий прогон не падает, сирот нет', async () => {
    const fake = new FakeNotion({ root: 'svc', failAfterCreates: 6 })
    await expect(run(fake)).rejects.toThrow(/обрыв/)
    const removed = fake.idByTitle('Глубже')
    const alpha = fake.idByTitle('01 · Альфа')
    const m = MINI_COURSE.modules.ru[0]
    const input = { ...MINI_COURSE, concepts: MINI_COURSE.concepts.filter((concept) => concept.source.unit !== '01-alpha/u2-deep'), modules: { ...MINI_COURSE.modules, ru: [{ ...m, units: m.units.slice(0, -1) }, ...MINI_COURSE.modules.ru.slice(1)] } }
    await expect(run(fake, input)).resolves.toBeDefined()
    expect(fake.get(removed).inTrash).toBe(true)
    expect(fake.live().filter((p) => p.parent === alpha && p.title === 'Глубже')).toHaveLength(0)
  })
  it('only после полного прогона: модуль переименован, теги чужих модулей в книге целы, корзины нет', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake)
    const beta = fake.idByTitle('02 · Бета'), book = fake.idByTitle('Модули'); fake.log.length = 0
    const ru = MINI_COURSE.modules.ru.map((x) => (x.slug === '01-alpha' ? { ...x, title: 'Альфа 2' } : x))
    await run(fake, { ...MINI_COURSE, only: '01-alpha', modules: { ...MINI_COURSE.modules, ru } }, { only: '01-alpha', sha: 'f00ba12' + SHA.slice(7) })
    expect(fake.log).toContain(`replace ${book}`)
    expect(fake.log.some((l) => l.startsWith('trash'))).toBe(false)
    expect(fake.get(beta).inTrash).toBe(false)
    expect(fake.get(book).markdown).toContain(pageTag(notionUrl(beta), '02 · Бета'))
  })
  it('FakeNotion: запись без тега любого живого ребёнка — отказ 400 с его заголовком', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const a = await fake.createPage('svc', 'A')
    await fake.createPage(a.id, 'B')
    const c = await fake.createPage(a.id, 'C')
    const e = await fake.replaceMarkdown(a.id, pageTag(notionUrl(c.id), 'C')).catch((x) => x)
    expect(e).toMatchObject({ status: 400, code: 'validation_error' })
    expect(String(e.message)).toContain('B')
  })
  it('новый коммит, Notion отдаёт текст не байт в байт — переписаны только корень и манифест', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake); fake.log.length = 0
    const read = fake.getMarkdown.bind(fake), manifest = fake.idByTitle(MANIFEST_TITLE)
    fake.getMarkdown = async (id) => {
      const r = await read(id)
      return id === manifest ? r : { ...r, markdown: r.markdown.replace(/\n\n/g, '\n\n\n') }
    }
    await run(fake, MINI_COURSE, { sha: '1234567' + SHA.slice(7) })
    expect(fake.log).toEqual([`replace ${fake.idByTitle(rootTitle)}`, `replace ${manifest}`])
  })
  it('прогон упал на записи страницы — скелет уже в манифесте, переименование не плодит сироту', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const write = fake.replaceMarkdown.bind(fake)
    let broken = true
    fake.replaceMarkdown = async (id, md) => {
      if (broken && fake.get(id).title === 'Дальше') throw new NotionError(400, 'validation_error', 'boom')
      return write(id, md)
    }
    await expect(run(fake)).rejects.toThrow(/не удалась/)
    broken = false
    await expect(run(fake, withUnit('02-beta', 'u2-spare', (s) => s, 'Запас 2'))).resolves.toBeDefined()
    expect(fake.live().filter((p) => p.title.startsWith('Запас'))).toHaveLength(1)
  })
  it('корзина сохранена в манифесте до записи страниц — повтор её не повторяет', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake); const unit = fake.idByTitle('Запас')
    const m = MINI_COURSE.modules.ru[1]
    const input = { ...MINI_COURSE, modules: { ...MINI_COURSE.modules, ru: [MINI_COURSE.modules.ru[0], { ...m, units: m.units.slice(0, 1) }] } }
    const write = fake.replaceMarkdown.bind(fake), manifest = fake.idByTitle(MANIFEST_TITLE)
    let broken = true
    fake.replaceMarkdown = async (id, md) => {
      if (broken && id !== manifest) throw new NotionError(503, 'service_unavailable', 'down')
      return write(id, md)
    }
    await expect(run(fake, input)).rejects.toThrow(/не удалась/)
    broken = false; fake.log.length = 0
    await run(fake, input)
    expect(fake.log).not.toContain(`trash ${unit}`)
  })
  it('новое название базы доходит до корня', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake); const root = fake.idByTitle(rootTitle)
    await run(fake, { ...MINI_COURSE, config: { ...MINI_COURSE.config, title: { ...MINI_COURSE.config.title, ru: 'База 2' } } })
    expect(fake.get(root).title).toBe('База 2')
  })
  it('unchanged — только страницы без единой записи', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await run(fake); fake.log.length = 0
    const rep = await run(fake, withUnit('01-alpha', 'u2-deep', (s) => s, 'Ещё глубже'))
    const manifest = fake.idByTitle(MANIFEST_TITLE)
    const touched = new Set(fake.log.map((l) => l.split(' ')[1]).filter((id) => id !== manifest))
    expect(rep.unchanged).toBe(N - touched.size)
  })
  it('log: строки действий несут ключ страницы, принятие сироты тоже видно', async () => {
    const fake = new FakeNotion({ root: 'svc', failAfterCreates: 5 })
    await expect(run(fake)).rejects.toThrow(/обрыв/)
    const lines: string[] = []
    const rep = await run(fake, MINI_COURSE, { log: (l) => lines.push(l) })
    const keys = new Set(buildSite(MINI_COURSE).map((p) => p.key))
    const adopted = lines.filter((l) => l.startsWith('adopt ')).map((l) => l.slice('adopt '.length))
    const created = lines.filter((l) => l.startsWith('create ')).map((l) => l.slice('create '.length))
    expect(adopted).toHaveLength(rep.adopted)
    expect(created).toHaveLength(rep.created)
    for (const k of [...adopted, ...created]) expect(keys.has(k)).toBe(true)
  })
  it('якорь не найден — повторный прогон того же коммита ничего не пишет', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const list = fake.listChildren.bind(fake)
    fake.listChildren = async (id) => (await list(id)).filter((b) => b.type === 'child_page')
    await run(fake); fake.log.length = 0
    const rep = await run(fake)
    expect(rep.anchorMisses.length).toBeGreaterThan(0)
    expect(fake.log).toEqual([])
  })
})
