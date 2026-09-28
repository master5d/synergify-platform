// Гварды стартера студента (BACKLOG «Стартер студента ТС — агент-агностик»).
// Архив собирается из packs/tochka-sborki/starter.json на prebuild; здесь он собирается
// в памяти тем же кодом (scripts/build-starter.mjs) и проверяется как его увидит ученик:
// состав, отсутствие секретов и мусора, рабочий hook, связь со страницей и уроками.
// Два издания — RU (основное) и EN (starter.json → editions.en): общие гварды гоняются
// по обоим, язык EN-издания проверяется отдельно.
// Тест живёт в pack'е Точки Сборки и читает его напрямую — работает при любом COURSE_PACK.
import { describe, it, expect } from 'vitest'
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { buildStarter, readZip, starterEditions } from '../../scripts/build-starter.mjs'
import { STARTER } from './course/starter'
import { localizeLesson } from '../../lib/starter/starter'

const ROOT = process.cwd()
const PACK = join(ROOT, 'packs', 'tochka-sborki')

interface ZipEntry { name: string; data: Buffer; mode: number }
interface Built { archive: string; buffer: Buffer; manifest: { root: string } }

function open(edition?: string) {
  const built = buildStarter(PACK, edition) as Built
  const entries: ZipEntry[] = readZip(built.buffer)
  const rootDir = `${built.manifest.root}/`
  const files = new Map(entries.map((e) => [e.name.slice(rootDir.length), e]))
  const text = (p: string) => files.get(p)!.data.toString('utf8')
  return { edition, built, entries, rootDir, files, text }
}

const EDITIONS = { ru: open(), en: open('en') }
const ALL = Object.entries(EDITIONS) as [keyof typeof EDITIONS, ReturnType<typeof open>][]

it('у pack\'а ровно два издания стартера: основное (RU) и en', () => {
  expect(starterEditions(PACK)).toEqual([undefined, 'en'])
  expect(EDITIONS.ru.built.archive).toBe('tochka-starter.zip')
  expect(EDITIONS.en.built.archive).toBe('tochka-starter-en.zip')
})

describe.each(ALL)('стартер %s: состав архива', (loc, { entries, rootDir, files, text }) => {
  it('все записи лежат в одной корневой папке', () => {
    for (const e of entries) expect(e.name.startsWith(rootDir), e.name).toBe(true)
  })

  it('содержит обязательные файлы', () => {
    const required = [
      'README.md', 'AGENTS.md', 'CLAUDE.md', 'TODO.md', 'STATE.md', 'HYGIENE.md', '.gitignore',
      'my-experiments/README.md', 'my-templates/README.md',
      'my-templates/agent-charter.md', 'my-templates/automation-recipes.md',
      'my-templates/feedback-template.md', 'my-templates/feedback-final-jtbd.md',
      'hooks/session-start.mjs', '.claude/settings.json', '.codex/hooks.json',
    ]
    const missing = required.filter((f) => !files.has(f))
    expect(missing, `нет в архиве: ${missing.join(', ')}`).toEqual([])
  })

  it('исходные имена без точки переименованы (dot-claude/, gitignore не утекли)', () => {
    const leaked = [...files.keys()].filter((p) => /^(dot-|gitignore$)/.test(p))
    expect(leaked).toEqual([])
  })

  it('шаблоны — те же файлы, что в LMS/tochka-sborki/my-templates (EN — в my-templates/en/)', () => {
    const dir = loc === 'en' ? join(ROOT, '..', 'my-templates', 'en') : join(ROOT, '..', 'my-templates')
    for (const name of ['agent-charter.md', 'automation-recipes.md', 'feedback-template.md', 'feedback-final-jtbd.md']) {
      const src = readFileSync(join(dir, name), 'utf8').replace(/\r\n/g, '\n')
      expect(text(`my-templates/${name}`), name).toBe(src)
    }
  })

  it('hook-скрипт исполняемый, остальное — обычные файлы', () => {
    expect(files.get('hooks/session-start.mjs')!.mode & 0o111).toBeTruthy()
    expect(files.get('AGENTS.md')!.mode & 0o111).toBe(0)
  })

  it('сборка детерминирована: тот же исходник → тот же архив', () => {
    const again = buildStarter(PACK, loc === 'en' ? 'en' : undefined) as Built
    expect(again.buffer.equals(EDITIONS[loc].built.buffer)).toBe(true)
  })
})

it('издания совпадают по составу: EN — перевод RU, а не другой стартер', () => {
  expect([...EDITIONS.en.files.keys()]).toEqual([...EDITIONS.ru.files.keys()])
  // Конфиг hook'а Claude Code не зависит от языка — один и тот же.
  expect(EDITIONS.en.text('.claude/settings.json')).toBe(EDITIONS.ru.text('.claude/settings.json'))
  expect(EDITIONS.en.text('.gitignore').split('\n').filter((l) => l && !l.startsWith('#')))
    .toEqual(EDITIONS.ru.text('.gitignore').split('\n').filter((l) => l && !l.startsWith('#')))
})

describe('стартер en: язык', () => {
  const CYR = /[\u0400-\u04FF]/
  it('проверка прибора: регэксп ловит кириллицу', () => {
    expect(CYR.test('Точка')).toBe(true)
    expect(CYR.test('Tochka Sborki')).toBe(false)
  })

  it.each([...EDITIONS.en.files.keys()])('%s — без кириллицы', (p) => {
    const lines = EDITIONS.en.text(p).split('\n').map((l, i) => [i + 1, l] as const).filter(([, l]) => CYR.test(l))
    expect(lines.map(([n, l]) => `${n}: ${l}`)).toEqual([])
  })

  it('RU-издание действительно русское (иначе сверка выше ничего не значит)', () => {
    expect(CYR.test(EDITIONS.ru.text('AGENTS.md'))).toBe(true)
    expect(CYR.test(EDITIONS.ru.text('hooks/session-start.mjs'))).toBe(true)
  })
})

// Паттерны ключей популярных провайдеров + приватные ключи + общие «key = длинное значение».
const SECRET_PATTERNS: [string, RegExp][] = [
  ['OpenAI/Anthropic-ключ', /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['Hugging Face token', /\bhf_[A-Za-z0-9]{30,}/],
  ['Telegram bot token', /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/],
  ['приватный ключ', /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/],
  ['key = значение', /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"]?[A-Za-z0-9_\-/+]{16,}/i],
]
// Следы лаборатории, которым не место в раздаче ученику: личные пути, адреса узлов, почта.
const LAB_LEAKS: [string, RegExp][] = [
  ['tailnet-адрес', /\.ts\.net\b|taile5b8dd/i],
  ['путь лаборатории', /C:\\telo|\/c\/telo|C:\\agents|C:\\Users\\/i],
  ['адрес почты', /[\w.+-]+@[\w-]+\.(?:com|ru|net|org|io|dev)\b/i],
  ['гейтвей лаборатории', /sovrn|litellm/i],
]

it('паттерны секретов вообще ловят ключ (проверка прибора на известном ответе)', () => {
  const fake = ['sk-ant-', 'A'.repeat(24)].join('')
  expect(SECRET_PATTERNS.some(([, re]) => re.test(`KEY=${fake}`))).toBe(true)
  expect(LAB_LEAKS.some(([, re]) => re.test('see C:\\telo\\x'))).toBe(true)
})

describe.each(ALL)('стартер %s: нет секретов и мусора', (_loc, { files, text }) => {
  it.each([...files.keys()])('%s — без ключей и следов лаборатории', (p) => {
    const s = text(p)
    const hits = [...SECRET_PATTERNS, ...LAB_LEAKS].filter(([, re]) => re.test(s)).map(([n]) => n)
    expect(hits, `${p}: ${hits.join(', ')}`).toEqual([])
  })

  it('нет мусора: .env, системных файлов, логов, node_modules', () => {
    const junk = [...files.keys()].filter((p) =>
      /(^|\/)\.env(\.|$)|(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$|\.log$|(^|\/)node_modules\//.test(p))
    expect(junk).toEqual([])
  })

  it('текст — UTF-8 без BOM и с LF', () => {
    for (const [p, e] of files) {
      expect(e.data.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])), `${p}: BOM`).toBe(false)
      expect(e.data.includes('\r\n'), `${p}: CRLF`).toBe(false)
    }
  })

  it('.gitignore не пускает в git ключи и личные настройки агентов', () => {
    const gi = text('.gitignore')
    for (const line of ['.env*', '!.env.example', '.claude/settings.local.json', 'CLAUDE.local.md', 'AGENTS.override.md']) {
      expect(gi.split('\n')).toContain(line)
    }
  })
})

describe.each(ALL)('стартер %s: один файл правил для всех агентов', (_loc, { files, text }) => {
  it('CLAUDE.md подключает AGENTS.md импортом (работает в любой версии Claude Code)', () => {
    expect(text('CLAUDE.md').split('\n')[0]).toBe('@AGENTS.md')
  })

  it('AGENTS.md короткий: до ~200 строк (05/u3) и в пределах лимита Codex 32 KiB', () => {
    const a = files.get('AGENTS.md')!.data
    expect(a.toString('utf8').split('\n').length).toBeLessThanOrEqual(200)
    expect(a.length).toBeLessThan(32 * 1024)
  })

  it('AGENTS.md учит памяти между сессиями и держит ключи вне файлов', () => {
    const a = text('AGENTS.md')
    expect(a).toMatch(/STATE\.md/)
    expect(a).toMatch(/TODO\.md/)
    expect(a).toMatch(/my-experiments\//)
    expect(a).toMatch(/\.env/)
  })

  it('нет .hermes.md и AGENTS.override.md — они перебили бы AGENTS.md у Hermes/Codex', () => {
    expect(files.has('.hermes.md')).toBe(false)
    expect(files.has('AGENTS.override.md')).toBe(false)
  })
})

describe.each(ALL)('стартер %s: hook начала сессии', (loc, { files, text }) => {
  const claude = JSON.parse(text('.claude/settings.json'))
  const codex = JSON.parse(text('.codex/hooks.json'))

  it('Claude Code: SessionStart в exec-форме через ${CLAUDE_PROJECT_DIR}', () => {
    const h = claude.hooks.SessionStart[0].hooks[0]
    expect(h.type).toBe('command')
    expect(h.command).toBe('node')
    expect(h.args).toEqual(['${CLAUDE_PROJECT_DIR}/hooks/session-start.mjs'])
  })

  it('Codex: SessionStart вызывает тот же скрипт', () => {
    const h = codex.hooks.SessionStart[0].hooks[0]
    expect(h.type).toBe('command')
    expect(h.command).toBe('node hooks/session-start.mjs')
  })

  it('скрипт из распакованного архива печатает STATE.md и TODO.md, но не AGENTS.md (вторая копия)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'starter-'))
    try {
      for (const [p, e] of files) {
        const abs = join(dir, p)
        mkdirSync(dirname(abs), { recursive: true })
        writeFileSync(abs, e.data)
      }
      const out = execFileSync(process.execPath, [join(dir, 'hooks', 'session-start.mjs')], { cwd: tmpdir(), encoding: 'utf8', timeout: 10_000 })
      expect(out).toContain('===== STATE.md =====')
      expect(out).toContain('===== TODO.md =====')
      expect(out).not.toContain('===== AGENTS.md =====')
      expect(out).toContain(loc === 'en' ? '# Project state' : '# Состояние проекта')
      expect(out).toContain(loc === 'en' ? 'Project memory (session-start hook)' : 'Память проекта (hook начала сессии)')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('страница «Стартер»', () => {
  const s = STARTER!

  it('ссылка на скачивание в каждой локали совпадает со своим архивом', () => {
    expect(s.archive.ru).toBe(`/downloads/${EDITIONS.ru.built.archive}`)
    expect(s.archive.en).toBe(`/downloads/${EDITIONS.en.built.archive}`)
    expect(s.folder).toBe(EDITIONS.ru.built.manifest.root)
    expect(s.folder).toBe(EDITIONS.en.built.manifest.root)
  })

  it('каталог архива не совпадает с маршрутом страницы (иначе export затрёт файл)', () => {
    // Случай сборки 2026-09-28: архив в public/starter/ рядом со страницей /starter/ —
    // next export положил туда index.html, а zip в out/ не доехал. Ни одной ошибки.
    for (const href of [s.archive.ru, s.archive.en]) {
      const dir = href.split('/')[1]
      expect(existsSync(join(ROOT, 'app', dir)), `app/${dir} — маршрут`).toBe(false)
    }
  })

  it('владение public/downloads/ объявлено pack\'ом (prune-public не вырежет архив)', () => {
    const owned = JSON.parse(readFileSync(join(PACK, 'public-owned.json'), 'utf8')).files
    expect(owned).toContain('downloads/')
  })

  it('четыре агента, у каждого — официальный источник', () => {
    expect(s.agents.map((a) => a.id)).toEqual(['claude-code', 'codex', 'antigravity', 'hermes'])
    for (const a of s.agents) {
      expect(a.sources.length, a.id).toBeGreaterThan(0)
      for (const src of a.sources) expect(src.href, a.id).toMatch(/^https:\/\//)
      // Команда запуска названа в тексте вкладки на обоих языках.
      if (a.command) for (const loc of ['ru', 'en'] as const) expect(a.open[loc], `${a.id}.${loc}`).toContain(a.command)
    }
  })

  it('все тексты есть на ru и en', () => {
    const empty: string[] = []
    const walk = (v: unknown, path: string) => {
      if (v && typeof v === 'object') {
        const o = v as Record<string, unknown>
        if ('ru' in o && 'en' in o) {
          if (!String(o.ru).trim()) empty.push(`${path}.ru`)
          if (!String(o.en).trim()) empty.push(`${path}.en`)
          return
        }
        for (const [k, x] of Object.entries(o)) walk(x, `${path}.${k}`)
      }
    }
    walk(s, 'STARTER')
    expect(empty).toEqual([])
  })

  it('ссылки на уроки ведут в существующие юниты обеих локалей', () => {
    const hrefs = [...s.related.map((r) => r.href), ...s.files.flatMap((f) => (f.lesson ? [f.lesson] : []))]
    const bad: string[] = []
    for (const href of hrefs) {
      const [, , mod, unit] = href.replace(/\/$/, '').split('/')
      for (const loc of ['ru', 'en']) {
        if (!existsSync(join(PACK, 'content', loc, mod, `${unit}.mdx`))) bad.push(`${loc}: ${href}`)
      }
    }
    expect(bad).toEqual([])
    expect(localizeLesson('/lessons/07-tools/u6-pendel/', 'en')).toBe('/en/lessons/07-tools/u6-pendel/')
  })

  it('маршруты /starter и /en/starter существуют', () => {
    expect(existsSync(join(ROOT, 'app', 'starter', 'page.tsx'))).toBe(true)
    expect(existsSync(join(ROOT, 'app', 'en', 'starter', 'page.tsx'))).toBe(true)
  })

  it('на стартер ссылаются модуль 02 (setup), kickstart и материалы — в своей локали', () => {
    const lesson = (loc: string, p: string) => readFileSync(join(PACK, 'content', loc, p), 'utf8')
    for (const p of ['02-setup-guide/u3-first-project.mdx', '00-kickstart/u3-first-steps.mdx']) {
      expect(lesson('ru', p), `ru/${p}`).toContain('](/starter/)')
      expect(lesson('en', p), `en/${p}`).toContain('](/en/starter/)')
    }
    expect(readFileSync(join(PACK, 'materials.ts'), 'utf8')).toContain("href: '/starter/'")
  })
})

// Одна схема файлов правил для стартера и уроков (рисерч docs/superpowers/research/
// 2026-09-28-agent-rules-files-best-practice.md): AGENTS.md — контекст и правила,
// CLAUDE.md — строка @AGENTS.md. Уроки не должны снова учить делить их на «контекст/инструкции».
describe('уроки учат той же схеме, что стартер', () => {
  const read = (loc: string, p: string) => readFileSync(join(PACK, 'content', loc, p), 'utf8')
  const UNITS = ['02-setup-guide/u3-first-project.mdx', '05-context-memory/u3-memory.mdx']

  it.each(['ru', 'en'])('%s: 02/u3 и 05/u3 создают CLAUDE.md строкой @AGENTS.md', (loc) => {
    for (const p of UNITS) {
      const s = read(loc, p)
      expect(s, p).toContain("echo '@AGENTS.md' > CLAUDE.md")
      expect(s, p).toContain("Set-Content CLAUDE.md '@AGENTS.md'")
      // Пустой CLAUDE.md рядом с AGENTS.md выключил бы чтение AGENTS.md в Claude Code.
      expect(s, p).not.toMatch(/touch CLAUDE\.md|ni CLAUDE\.md/)
    }
  })

  it.each(['ru', 'en'])('%s: 05/u3 знает STATE.md и не делит «CLAUDE.md — контекст / AGENTS.md — инструкции»', (loc) => {
    const s = read(loc, '05-context-memory/u3-memory.mdx')
    expect(s).toMatch(/### STATE\.md/)
    expect(s).not.toMatch(/### CLAUDE\.md/)
  })
})
