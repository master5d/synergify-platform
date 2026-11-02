import { describe, it, expect } from 'vitest'
import { mkdtempSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { main, loadSiteInput } from './cli'
import { NotionError } from './client'
import { notionUrl, pageTag, parseMarkdown, TABLE_OF_CONTENTS, toNotionMarkdown } from './md'
import { MINI_COURSE } from './__fixtures__/mini-course'
import { FakeNotion } from './__fixtures__/fake-notion'
import { buildSite } from './site'
import { PACK_DIR, PACK_SLUG } from '../pack'

const TOKEN = 'secret-token-123', SHA = 'abcdef1234567890abcdef1234567890abcdef12', DATE = '2026-11-02'
const cap = () => { const out: string[] = [], err: string[] = []; return { out, err, io: { out: (l: string) => out.push(l), err: (l: string) => err.push(l) } } }

describe('notion-kb CLI', () => {
  it('check на фикстуре — 0', async () => { const t = cap(); expect(await main(['check'], {}, t.io, { input: MINI_COURSE })).toBe(0); expect(t.out.join('\n')).toMatch(/ошибок 0/) })
  it('check --out пишет страницы', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'kb-')); await main(['check', '--out', dir], {}, cap().io, { input: MINI_COURSE })
    expect(existsSync(join(dir, 'root.md'))).toBe(true); expect(existsSync(join(dir, 'ru__u__01-alpha__u1-start.md'))).toBe(true)
  })
  it('sync без токена — 1', async () => { const t = cap(); expect(await main(['sync'], {}, t.io, { input: MINI_COURSE })).toBe(1); expect(t.err.join('\n')).toMatch(/NOTION_KB_TOKEN/) })
  it('sync без servicePageId — 1 и путь конфига', async () => {
    const t = cap(); const input = { ...MINI_COURSE, config: { ...MINI_COURSE.config, servicePageId: null } }
    expect(await main(['sync'], { NOTION_KB_TOKEN: TOKEN }, t.io, { input })).toBe(1); expect(t.err.join('\n')).toMatch(/notion-kb\.config\.ts/)
  })
  it('sync с ошибкой check — 1, в Notion ничего', async () => {
    const fake = new FakeNotion({ root: 'svc' }); const bad = { ...MINI_COURSE, concepts: MINI_COURSE.concepts.map((c) => ({ ...c, short: { ru: 'нет такой фразы', en: c.short.en } })) }
    expect(await main(['sync'], { NOTION_KB_TOKEN: TOKEN }, cap().io, { input: bad, api: fake, sha: SHA, date: DATE })).toBe(1); expect(fake.log).toEqual([])
  })
  it('sync на FakeNotion — 0, отчёт, токена нет в выводе', async () => {
    const t = cap(); expect(await main(['sync'], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: new FakeNotion({ root: 'svc' }), sha: SHA, date: DATE })).toBe(0)
    expect(t.out.join('\n')).toMatch(/создано \d+/); expect([...t.out, ...t.err].join('\n')).not.toContain(TOKEN)
  })
  it('smoke пишет отправленное и прочитанное, страницу — в корзину', async () => {
    const fake = new FakeNotion({ root: 'svc' }); const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, cap().io, { input: MINI_COURSE, api: fake })).toBe(0)
    expect(existsSync(join(dir, 'smoke.read.md'))).toBe(true); expect(fake.live().some((p) => p.title === 'notion-kb · smoke')).toBe(false)
  })
  it('неизвестная команда — 2', async () => expect(await main(['nope'], {}, cap().io)).toBe(2))
  it('status: адрес корня, штамп и число страниц манифеста', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    await main(['sync'], { NOTION_KB_TOKEN: TOKEN }, cap().io, { input: MINI_COURSE, api: fake, sha: SHA, date: DATE })
    const t = cap()
    expect(await main(['status'], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(0)
    const out = t.out.join('\n')
    expect(out).toContain('abcdef1')
    expect(out).toContain(`страниц в манифесте: ${buildSite(MINI_COURSE).length}`)
  })
  it('status без servicePageId — список страниц для выбора S', async () => {
    const fake = new FakeNotion({ root: 'svc' }); await fake.createPage('svc', 'RAM home')
    const t = cap(); const input = { ...MINI_COURSE, config: { ...MINI_COURSE.config, servicePageId: null } }
    expect(await main(['status'], { NOTION_KB_TOKEN: TOKEN }, t.io, { input, api: fake })).toBe(0)
    expect(t.out.join('\n')).toContain('RAM home')
  })
  it('sync --only доходит и до набора страниц, и до синхронизации', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const deps = { input: MINI_COURSE, api: fake, sha: SHA, date: DATE }
    const env = { NOTION_KB_TOKEN: TOKEN }
    expect(await main(['sync', '--only', '01-alpha'], env, cap().io, deps)).toBe(0)
    expect(fake.live().some((p) => p.title === '02 · Бета')).toBe(false)
    expect(await main(['sync'], env, cap().io, deps)).toBe(0)
    fake.log.length = 0
    expect(await main(['sync', '--only', '01-alpha'], env, cap().io, { ...deps, sha: 'f00ba12' + SHA.slice(7) })).toBe(0)
    expect(fake.log.some((l) => l.startsWith('trash'))).toBe(false)
  })
  it('smoke при сбое — 1, страница всё равно в корзине', async () => {
    const fake = new FakeNotion({ root: 'svc' }); const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    fake.getMarkdown = async () => { throw new Error('boom') }
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, cap().io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(fake.live().some((p) => p.title === 'notion-kb · smoke')).toBe(false)
  })
  it('smoke: Notion принял запись без тега ребёнка — 1 и громкое сообщение', async () => {
    const fake = new FakeNotion({ root: 'svc' }); const dir = mkdtempSync(join(tmpdir(), 'kb-')); const t = cap()
    fake.replaceMarkdown = async () => {}
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(t.err.join('\n')).toMatch(/без тега/)
  })
  it('загрузчик грузит цепочку нативным Node: неизвестная команда — код 2', () => {
    const r = spawnSync(process.execPath, ['scripts/notion-kb.ts', 'nope'], { cwd: process.cwd(), encoding: 'utf8', timeout: 60_000 })
    expect(r.status).toBe(2)
  }, 90_000)
  it.runIf(PACK_SLUG === 'tochka-sborki')('loadSiteInput собирает вход из pack’а', async () => {
    const input = await loadSiteInput(PACK_DIR)
    expect(input.domain).toBe('https://ai.synergify.com')
    expect(input.config.title.ru).toBe('Точка Сборки — база знаний')
    expect(input.modules.ru.length).toBeGreaterThan(0)
    expect(input.modules.en.length).toBe(input.modules.ru.length)
  })
  it.runIf(PACK_SLUG === 'tochka-sborki')('loadSiteInput отдаёт MDX с концами строк LF', async () => {
    const input = await loadSiteInput(PACK_DIR)
    const m = input.modules.ru[0]
    expect(input.unitMdx('ru', m.slug, m.units[0].slug)).not.toContain('\r')
    expect(input.pageMdx('ru', 'cheatsheet').content).not.toContain('\r')
  })
  it('sync --only с неизвестным модулем — 2, Notion не тронут', async () => {
    const fake = new FakeNotion({ root: 'svc' }); const t = cap()
    expect(await main(['sync', '--only', '05-nope'], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake, sha: SHA, date: DATE })).toBe(2)
    expect(t.err.join('\n')).toContain('«05-nope» не найден')
    expect(fake.log).toHaveLength(0)
  })
  it('токен с переводом строки в конце — в тексте ошибки он под маской', async () => {
    const fake = new FakeNotion({ root: 'svc' }); const t = cap()
    fake.createPage = async () => { throw new Error(`эхо ${TOKEN}`) }
    expect(await main(['sync'], { NOTION_KB_TOKEN: `${TOKEN}\n` }, t.io, { input: MINI_COURSE, api: fake, sha: SHA, date: DATE })).toBe(1)
    expect(t.err.join('\n')).toContain('эхо ***')
    expect(t.err.join('\n')).not.toContain(TOKEN)
  })
  it('токен из одних пробелов — как без токена: 1, Notion не тронут', async () => {
    const fake = new FakeNotion({ root: 'svc' }); const t = cap()
    expect(await main(['sync'], { NOTION_KB_TOKEN: ' \n' }, t.io, { input: MINI_COURSE, api: fake, sha: SHA, date: DATE })).toBe(1)
    expect(t.err.join('\n')).toMatch(/NOTION_KB_TOKEN/)
    expect(fake.log).toHaveLength(0)
  })
  it('smoke: Notion принял запись и снёс ребёнка без тега — 1 и громкое сообщение', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    const t = cap()
    const write = fake.replaceMarkdown.bind(fake)
    fake.replaceMarkdown = async (id, md) => {
      try {
        await write(id, md)
      } catch {
        for (const p of fake.live()) if (p.parent === id && !md.includes(notionUrl(p.id))) await fake.trashPage(p.id)
        fake.setMarkdown(id, md)
      }
    }
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(t.err.join('\n')).toMatch(/без тега/)
  })
  it('smoke: Notion отказал в записи, но ребёнок без тега пропал — 1', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    const t = cap()
    const write = fake.replaceMarkdown.bind(fake)
    fake.replaceMarkdown = async (id, md) => {
      try {
        await write(id, md)
      } catch (error) {
        for (const p of fake.live()) if (p.parent === id && !md.includes(notionUrl(p.id))) await fake.trashPage(p.id)
        throw error
      }
    }
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(t.err.join('\n')).toMatch(/без тега/)
  })
  it('status: ошибка Notion — 1 и строка ОШИБКА под маской', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const t = cap()
    fake.listChildren = async () => { throw new Error(`эхо ${TOKEN}`) }
    expect(await main(['status'], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(t.err.join('\n')).toContain('ОШИБКА: эхо ***')
    expect(t.err.join('\n')).not.toContain(TOKEN)
  })
  it('smoke: ошибка с эхом токена — 1 и строка ОШИБКА под маской', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    const t = cap()
    fake.createPage = async () => { throw new Error(`эхо ${TOKEN}`) }
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(t.err.join('\n')).toContain('ОШИБКА: эхо ***')
    expect(t.err.join('\n')).not.toContain(TOKEN)
  })
  it('check --out в путь, занятый файлом, — 1 и строка ОШИБКА', async () => {
    const file = join(mkdtempSync(join(tmpdir(), 'kb-')), 'file')
    const t = cap()
    writeFileSync(file, 'x')
    expect(await main(['check', '--out', file], {}, t.io, { input: MINI_COURSE })).toBe(1)
    expect(t.err.join('\n')).toMatch(/^ОШИБКА: /m)
  })
  it('smoke: формы — как у генератора, дети в обратном порядке под своими заголовками', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    const ids = new Map<string, string>()
    const create = fake.createPage.bind(fake)
    fake.createPage = async (parent, title) => {
      const page = await create(parent, title)
      ids.set(title, page.id)
      return page
    }
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, cap().io, { input: MINI_COURSE, api: fake })).toBe(0)
    const sent = readFileSync(join(dir, 'smoke.sent.md'), 'utf8')
    expect(sent).toMatch(/<toggle>\n[^\n]+\n\n[^\n]+\n\n<toggle>\n[^\n]+\n\n[^\n]+\n<\/toggle>\n<\/toggle>/)
    expect(sent).toMatch(/<callout icon="🧪">\n[^\n]+\n\n[^\n]+\n<\/callout>/)
    expect(sent).toContain('````\nвнутри ``` кода\n````')
    expect(sent).toContain(TABLE_OF_CONTENTS)
    expect(sent).toContain(`${pageTag(notionUrl(ids.get('smoke child 2')!), 'smoke child 2')}\n\n${pageTag(notionUrl(ids.get('smoke child 1')!), 'smoke child 1')}`)
  })
  it('smoke: проба манифеста — в третьем ребёнке «manifest probe», размер печатается', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    const t = cap()
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(0)
    expect(fake.log).toContain('create manifest probe')
    expect(t.out.join('\n')).toMatch(/манифест.*\d+\.\d КБ/)
  })
  it('smoke: отправленное пишется до записи — при отказе Notion файл есть', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    fake.replaceMarkdown = async () => { throw new NotionError(400, 'validation_error', 'boom') }
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, cap().io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(existsSync(join(dir, 'smoke.sent.md'))).toBe(true)
  })
  it('sync --only без значения — 2 и usage, Notion не тронут', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const t = cap()
    expect(await main(['sync', '--only'], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake, sha: SHA, date: DATE })).toBe(2)
    expect(t.err.join('\n')).toMatch(/usage/)
    expect(fake.log).toHaveLength(0)
  })
  it('smoke без --out — 2 и usage, Notion не тронут', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const t = cap()
    expect(await main(['smoke'], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(2)
    expect(t.err.join('\n')).toMatch(/usage/)
    expect(fake.log).toHaveLength(0)
  })
  it('check --out: ссылки превью — в форме fakeResolver', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    expect(await main(['check', '--out', dir], {}, cap().io, { input: MINI_COURSE })).toBe(0)
    const book = readFileSync(join(dir, 'ru__book.md'), 'utf8')
    expect(book).toMatch(/https:\/\/www\.notion\.so\/[0-9a-f]{32}/)
    expect(book).not.toMatch(/https:\/\/www\.notion\.so\/(ru|en)\//)
  })
  it('smoke: проба 1 — ответ не отказ защиты: 1 и что пришло', async () => {
    const answers: Array<[Error, string]> = [
      [new NotionError(409, 'conflict_error', 'Conflict occurred while saving'), 'Notion ответил 409 conflict_error'],
      [new NotionError(400, 'invalid_request', 'Invalid request'), 'Notion ответил 400 invalid_request'],
      [new NotionError(422, 'validation_error', 'Unprocessable'), 'Notion ответил 422 validation_error'],
      [new Error('socket hang up'), 'сбой до ответа Notion'],
    ]
    for (const [error, answer] of answers) {
      const fake = new FakeNotion({ root: 'svc' })
      const dir = mkdtempSync(join(tmpdir(), 'kb-'))
      const t = cap()
      const write = fake.replaceMarkdown.bind(fake)
      fake.replaceMarkdown = async (id, md) => {
        if (md.endsWith('\n\nprobe')) throw error
        await write(id, md)
      }
      expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake }), answer).toBe(1)
      expect(t.err.join('\n')).toContain(`проба 1 не состоялась — ${answer}`)
      expect(t.err.join('\n')).toContain(error.message)
      expect(t.out.join('\n')).not.toContain('пробы пройдены')
    }
  })
  it('smoke: проба 1 — лимит блоков в любой форме: 1 и сообщение о лимите', async () => {
    const limits = [
      new NotionError(403, 'restricted_resource', 'Notion: лимит блоков Free (restricted_resource)', true),
      new NotionError(400, 'validation_error', 'Notion: лимит блоков Free (restricted_resource)', true),
    ]
    for (const limit of limits) {
      const fake = new FakeNotion({ root: 'svc' })
      const dir = mkdtempSync(join(tmpdir(), 'kb-'))
      const t = cap()
      const write = fake.replaceMarkdown.bind(fake)
      fake.replaceMarkdown = async (id, md) => {
        if (md.endsWith('\n\nprobe')) throw limit
        await write(id, md)
      }
      expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake }), String(limit.status)).toBe(1)
      expect(t.err.join('\n')).toMatch(/лимит блоков/)
      expect(t.out.join('\n')).not.toContain('пробы пройдены')
    }
  })
  it('smoke: проба 1 — в строке успеха ответ Notion под маской токена', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    const t = cap()
    const write = fake.replaceMarkdown.bind(fake)
    fake.replaceMarkdown = async (id, md) => {
      try {
        await write(id, md)
      } catch (error) {
        if (error instanceof NotionError) throw new NotionError(error.status, error.code, `${error.message} (эхо ${TOKEN})`)
        throw error
      }
    }
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(0)
    expect(t.out.join('\n')).toContain('отклонена (400 validation_error: missing children: smoke child 2 (эхо ***)), ребёнок жив')
    expect([...t.out, ...t.err].join('\n')).not.toContain(TOKEN)
  })
  it('sync: строки лога идут под маской токена', async () => {
    const t = cap()
    expect(await main(['sync'], { NOTION_KB_TOKEN: 'alpha' }, t.io, { input: MINI_COURSE, api: new FakeNotion({ root: 'svc' }), sha: SHA, date: DATE })).toBe(0)
    expect(t.out.join('\n')).toContain('create ru/u/01-***/u1-start')
    expect([...t.out, ...t.err].join('\n')).not.toContain('alpha')
  })
  it('smoke: размер манифеста печатается до записи — при отказе записи он виден', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    const t = cap()
    const write = fake.replaceMarkdown.bind(fake)
    fake.replaceMarkdown = async (id, md) => {
      if (fake.get(id).title === 'manifest probe') throw new Error('boom')
      await write(id, md)
    }
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(t.out.join('\n')).toMatch(/синтетический манифест — \d+\.\d КБ/)
  })
  it('smoke: таблица и код — в форме сериализатора генератора', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, cap().io, { input: MINI_COURSE, api: fake })).toBe(0)
    const sent = readFileSync(join(dir, 'smoke.sent.md'), 'utf8')
    expect(sent).toContain(toNotionMarkdown(parseMarkdown('| a | b |\n|---|---|\n| x \\| y | z |')))
    expect(sent).toContain(toNotionMarkdown(parseMarkdown(`\`\`\`\n${'y'.repeat(2500)}\n\`\`\``)))
  })
  it('флаг без значения или со значением-флагом — 2 и usage, Notion не тронут', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    for (const argv of [['check', '--out'], ['sync', '--only', '--out'], ['smoke', '--out', '--only']]) {
      const t = cap()
      expect(await main(argv, { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake, sha: SHA, date: DATE }), argv.join(' ')).toBe(2)
      expect(t.err.join('\n')).toMatch(/usage/)
    }
    expect(fake.log).toHaveLength(0)
  })
  it('неизвестный аргумент — 2 и usage, Notion не тронут', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const calls = [
      ['sync', '--only=01-alpha'],
      ['sync', '--onyl', '01-alpha'],
      ['sync', '01-alpha'],
      ['sync', '-only', '01-alpha'],
      ['sync', '--only', '01-alpha', '--only', '02-beta'],
      ['check', '--only', '01-alpha'],
      ['status', '--out', 'x'],
    ]
    for (const argv of calls) {
      const t = cap()
      expect(await main(argv, { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake, sha: SHA, date: DATE }), argv.join(' ')).toBe(2)
      expect(t.err.join('\n')).toMatch(/usage/)
    }
    expect(fake.log).toHaveLength(0)
  })
  it('smoke --out в путь, занятый файлом, — 1, в Notion ничего не создано', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const file = join(mkdtempSync(join(tmpdir(), 'kb-')), 'file')
    const t = cap()
    writeFileSync(file, 'x')
    expect(await main(['smoke', '--out', file], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(t.err.join('\n')).toMatch(/^ОШИБКА: /m)
    expect(fake.log).toHaveLength(0)
  })
  it('smoke: страница не ушла в корзину — 1 и строка ОШИБКА', async () => {
    const fake = new FakeNotion({ root: 'svc' })
    const dir = mkdtempSync(join(tmpdir(), 'kb-'))
    const t = cap()
    fake.trashPage = async () => {
      throw new Error('trash down')
    }
    expect(await main(['smoke', '--out', dir], { NOTION_KB_TOKEN: TOKEN }, t.io, { input: MINI_COURSE, api: fake })).toBe(1)
    expect(t.err.join('\n')).toContain('ОШИБКА: smoke: страница не ушла в корзину: trash down')
  })
})
