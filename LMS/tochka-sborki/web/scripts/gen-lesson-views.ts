// Генератор представлений урока (спека docs/superpowers/specs/2026-09-28-lesson-views.md).
// Запуск из web/ (нативный type stripping Node ≥ 23, без tsx):
//   node scripts/gen-lesson-views.ts                     — пересобрать ВСЕ существующие артефакты (починка устаревания)
//   node scripts/gen-lesson-views.ts <pack>              — создать/обновить артефакты всех модулей pack'а (ru+en)
//   node scripts/gen-lesson-views.ts <pack> <module>     — то же для одного модуля
//   … --force                                            — перезаписать и файлы с ручными пунктами
//   … --paraphrase                                       — после извлечения: пересказ конспекта через гейтвей
//   … --paraphrase --refresh                             — пересказать заново и уже пересказанные разделы
//   … --report <file.json>                               — все ответы модели с вердиктом гварда (для вычитки)
//   … --pin-verbatim <pack>/<locale>/<module>/<unit>#<заголовок>  — закрепить раздел дословным по итогам вычитки
//                                                          (verbatim: "review"; модель его больше не получает, даже с --refresh)
//
// Дословная часть (extract) детерминирована, сети не требует. Готовый пересказ переносится между пересборками
// по хэшу раздела: раздел не изменился — пересказ остаётся, изменился — выпадает (и это печатается).
// Пересказ: гейтвей SOVERN (LITELLM_URL, по умолчанию https://sovrn-mini.taile5b8dd.ts.net/v1), пул prose-pool,
// ключ — переменная окружения LITELLM_KEY (конвенция лаборатории; значение нигде не печатается).
//
// Exit: 0 — всё собрано; 1 — ошибки сборки/пропуски; 3 — пересказ просили, но он неполный не по решению гварда
// (нет ключа, транспортный отказ, пустой/битый ответ после повторов): такие разделы остались дословными —
// это деградация, а не успех. Отказ гварда — не ошибка: раздел честно остаётся дословным, счёт печатается.
import { registerHooks } from 'node:module'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Исходники lib/ импортируют друг друга без расширения (так их собирает Next/vitest). Нативному Node
// подсказываем `.ts` — только для относительных импортов, у которых расширения нет.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/^\.\.?\//.test(specifier) && !/\.[cm]?[jt]sx?$|\.json$/.test(specifier)) {
      try { return nextResolve(`${specifier}.ts`, context) } catch { /* ниже — как есть */ }
    }
    return nextResolve(specifier, context)
  },
})

type Extract = typeof import('../lib/lesson-views/extract')
type Paraphrase = typeof import('../lib/lesson-views/paraphrase')
type ManifestRule = import('../lib/authoring/manifest').ManifestRule
type Artifact = import('../lib/lesson-views/extract').LessonViewsArtifact
type OutlineNode = import('../lib/lesson-views/extract').OutlineNode
// Импорт с расширением .ts нужен Node; tsc его не проверяет (строка), типы берём из type-only import выше.
const ex = (await import(new URL('../lib/lesson-views/extract.ts', import.meta.url).href)) as Extract
const pp = (await import(new URL('../lib/lesson-views/paraphrase.ts', import.meta.url).href)) as Paraphrase

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..')
const PACKS = join(WEB, 'packs')
const LOCALES = ['ru', 'en'] as const
type Locale = (typeof LOCALES)[number]

const argv = process.argv.slice(2)
const force = argv.includes('--force')
const paraphrase = argv.includes('--paraphrase')
const refresh = argv.includes('--refresh')
const reportIdx = argv.indexOf('--report')
const reportPath = reportIdx >= 0 ? argv[reportIdx + 1] : undefined
const valueIdx = new Set(argv.flatMap((a, i) => (a === '--report' || a === '--pin-verbatim' ? [i + 1] : [])))
const pins = argv.flatMap((a, i) => (a === '--pin-verbatim' && argv[i + 1] ? [argv[i + 1]] : []))
const positional = argv.filter((a, i) => !a.startsWith('--') && !valueIdx.has(i))
const [packArg, moduleArg] = positional

function artifactPath(pack: string, locale: string, module: string, unit: string): string {
  return join(PACKS, pack, 'views', locale, module, `${unit}.json`)
}

function contentOf(pack: string, locale: Locale, module: string, unit: string) {
  const contentDir = join(PACKS, pack, 'content', locale, module)
  const meta = JSON.parse(readFileSync(join(contentDir, '_meta.json'), 'utf8'))
  const u = (meta.units as { slug: string; title: string }[]).find(x => x.slug === unit)
  if (!u) throw new Error(`${pack}/${locale}/${module}: юнита ${unit} нет в _meta.json`)
  return { meta, title: u.title, mdx: readFileSync(join(contentDir, `${unit}.mdx`), 'utf8') }
}

function serialize(a: Artifact): string {
  return JSON.stringify(a, null, 2) + '\n'
}

type Section = import('../lib/lesson-views/paraphrase').ParaphraseSection

/** Пересказ предыдущей версии, чьи разделы не изменились; порядок — по текущему outline. Почти дословный
 *  пересказ (схожесть ≥ NEAR_IDENTICAL) становится меткой `near-identical` — детерминированно, без сети.
 *  Закрепления `--pin-verbatim` этого юнита ставят метку `review`. */
function carryParaphrase(prev: Artifact | null, outline: OutlineNode[], unitPins: string[]): { block?: Artifact['paraphrase']; dropped: number; near: number } {
  const old = prev?.paraphrase
  const nodes = pp.sectionsWithPoints(outline)
  const byHash = new Map((old?.sections ?? []).map(s => [s.sourceHash, s]))
  for (const heading of unitPins) {
    const n = nodes.find(x => x.heading === heading)
    if (!n) throw new Error(`--pin-verbatim: раздела «${heading}» с тезисами нет`)
    byHash.set(pp.sectionHash(n), { sourceHash: pp.sectionHash(n), verbatim: 'review' })
  }
  let near = 0
  const kept = nodes.flatMap(n => {
    const s = byHash.get(pp.sectionHash(n))
    if (!s) return []
    if (s.points && !s.verbatim) {
      const settled = pp.settleSection(n, s.points)
      if (settled.verbatim) near++
      return [settled]
    }
    return [s]
  })
  const current = new Set(nodes.map(n => pp.sectionHash(n)))
  const dropped = (old?.sections ?? []).filter(s => !current.has(s.sourceHash)).length
  const meta = old ?? { source: 'paraphrase' as const, generator: pp.PARAPHRASE_GENERATOR, pool: pp.PARAPHRASE_POOL, sections: [] }
  return { block: kept.length ? { ...meta, sections: kept } : undefined, dropped, near }
}

type Outcome = 'written' | 'same' | 'skipped' | 'empty'

function generate(pack: string, locale: Locale, module: string, unit: string): Outcome {
  const { meta, title, mdx } = contentOf(pack, locale, module, unit)
  const next: Artifact = ex.buildArtifact({ module, unit, locale, title, mdx, checks: meta.checks })
  const out = artifactPath(pack, locale, module, unit)
  const prevRaw = existsSync(out) ? readFileSync(out, 'utf8') : null
  const prev = prevRaw ? (JSON.parse(prevRaw) as Artifact) : null
  if (!ex.flattenOutline(next.outline).some(x => x.point)) {
    // Концепт-фаза без прозы (только шаблон в коде/таблица): конспектировать нечего — вкладок у юнита нет.
    if (prevRaw) rmSync(out)
    console.log(`EMPTY ${pack}/${locale}/${module}/${unit}: в концепт-фазе нет прозы — артефакта нет`)
    return 'empty'
  }
  const unitPins = pins.flatMap(p => (p.startsWith(`${pack}/${locale}/${module}/${unit}#`) ? [p.slice(p.indexOf('#') + 1)] : []))
  const { block, dropped, near } = carryParaphrase(prev, next.outline, unitPins)
  if (block) next.paraphrase = block
  if (near) console.log(`NEAR ${pack}/${locale}/${module}/${unit}: ${near} разд. — пересказ почти дословный, не хранится`)
  if (dropped) console.log(`STALE ${pack}/${locale}/${module}/${unit}: пересказ ${dropped} разд. выпал (раздел изменился) — --paraphrase`)
  const json = serialize(next)
  if (prevRaw === json) return 'same'
  if (prev && !force && ex.hasManualPoints(prev)) {
    console.error(`SKIP ${out}: есть ручные пункты — сверь руками или --force`)
    return 'skipped'
  }
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, json, 'utf8')
  return 'written'
}

function modulesOf(pack: string): string[] {
  const root = join(PACKS, pack, 'content', 'ru')
  return readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(root, d.name, '_meta.json')))
    .map(d => d.name)
    .sort()
}

const jobs: [string, Locale, string, string][] = []
if (packArg) {
  if (!existsSync(join(PACKS, packArg))) {
    console.error(`usage: node scripts/gen-lesson-views.ts [<pack> [<module>]] [--force] [--paraphrase [--refresh]] [--report <file>]`)
    process.exit(2)
  }
  for (const module of moduleArg ? [moduleArg] : modulesOf(packArg)) {
    for (const locale of LOCALES) {
      const meta = JSON.parse(readFileSync(join(PACKS, packArg, 'content', locale, module, '_meta.json'), 'utf8'))
      for (const u of meta.units as { slug: string }[]) jobs.push([packArg, locale, module, u.slug])
    }
  }
} else {
  for (const pack of readdirSync(PACKS)) {
    if (pack.startsWith('_')) continue
    for (const locale of LOCALES) {
      const root = join(PACKS, pack, 'views', locale)
      if (!existsSync(root)) continue
      for (const module of readdirSync(root)) {
        for (const f of readdirSync(join(root, module))) {
          if (f.endsWith('.json')) jobs.push([pack, locale, module, f.replace(/\.json$/, '')])
        }
      }
    }
  }
}

let failed = 0
const tally: Record<Outcome, number> = { written: 0, same: 0, skipped: 0, empty: 0 }
for (const [pack, locale, module, unit] of jobs) {
  try {
    tally[generate(pack, locale, module, unit)]++
  } catch (e) {
    failed++
    console.error(`FAIL ${pack}/${locale}/${module}/${unit}: ${(e as Error).message}`)
  }
}
console.log(`gen-lesson-views: ${jobs.length} юнитов — записано ${tally.written}, без изменений ${tally.same}, без прозы ${tally.empty}, пропущено ${tally.skipped}, ошибок ${failed}`)

// ── Пересказ ──────────────────────────────────────────────────────────────────

const GATEWAY = (process.env.LITELLM_URL || 'https://sovrn-mini.taile5b8dd.ts.net/v1').replace(/\/+$/, '')
const CALL_TIMEOUT_MS = 120_000
const MAX_TOKENS = 12000 // пул «думает»: маленький бюджет съедается рассуждением, и content приходит пустым
const CONCURRENCY = 4
const MAX_ATTEMPTS = 5
const EMPTY_RETRIES = 3
const BATCH = 3 // разделов на вызов

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

class TransportError extends Error {}

async function callGateway(key: string, system: string, user: string): Promise<{ content: string; finish: string }> {
  let lastErr = ''
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res: Response
    try {
      res = await fetch(`${GATEWAY}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'x-sovern-agent': 'lms-lesson-views',
        },
        signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
        body: JSON.stringify({
          model: pp.PARAPHRASE_POOL,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          temperature: 0.3,
          max_tokens: MAX_TOKENS,
        }),
      })
    } catch (e) {
      lastErr = (e as Error).name === 'TimeoutError' ? `таймаут ${CALL_TIMEOUT_MS} мс` : `гейтвей недоступен (${(e as Error).name})`
      await sleep(3000 * attempt)
      continue
    }
    if (res.status === 429 || res.status >= 500) {
      const ra = Number(res.headers.get('retry-after'))
      lastErr = `HTTP ${res.status}`
      await res.body?.cancel()
      await sleep(Number.isFinite(ra) && ra > 0 ? Math.min(ra, 60) * 1000 : 5000 * 2 ** (attempt - 1))
      continue
    }
    if (!res.ok) {
      await res.body?.cancel()
      throw new TransportError(`HTTP ${res.status}`)
    }
    const data = (await res.json().catch(() => null)) as { choices?: { finish_reason?: unknown; message?: { content?: unknown } }[] } | null
    const content = data?.choices?.[0]?.message?.content
    return { content: typeof content === 'string' ? content : '', finish: String(data?.choices?.[0]?.finish_reason ?? '—') }
  }
  throw new TransportError(`${lastErr} после ${MAX_ATTEMPTS} попыток`)
}

interface ReportRow { unit: string; heading: string; verbatim: string[]; points: string[]; findings: string[]; raw?: string }

async function paraphraseAll(): Promise<number> {
  const key = process.env.LITELLM_KEY
  if (!key) {
    console.error('ПЕРЕСКАЗА НЕТ: LITELLM_KEY не задан — артефакты остались дословными (exit 3)')
    return 3
  }
  const rulesCache = new Map<string, ManifestRule[]>()
  const rulesOf = async (pack: string) => {
    if (!rulesCache.has(pack)) {
      const m = await import(pathToFileURL(join(PACKS, pack, 'manifest.ts')).href)
      rulesCache.set(pack, m.MANIFEST as ManifestRule[])
    }
    return rulesCache.get(pack)!
  }

  const targets = jobs.filter(([pack, locale, module, unit]) => existsSync(artifactPath(pack, locale, module, unit)))
  const stats = { units: 0, sections: 0, accepted: 0, near: 0, rejected: 0, empty: 0, transport: 0 }
  const reasons = new Map<string, number>()
  const report: ReportRow[] = []

  const work = async ([pack, locale, module, unit]: (typeof jobs)[number]) => {
    const at = `${pack}/${locale}/${module}/${unit}`
    const file = artifactPath(pack, locale, module, unit)
    const a = JSON.parse(readFileSync(file, 'utf8')) as Artifact
    const { mdx } = contentOf(pack, locale, module, unit)
    const rules = await rulesOf(pack)
    // Уже решённые разделы не отправляются: пересказ, метка near-identical; метка review — даже при --refresh.
    const have = new Set((a.paraphrase?.sections ?? []).filter(s => !refresh || s.verbatim === 'review').map(s => s.sourceHash))
    const nodes = pp.sectionsWithPoints(a.outline)
    const todo = nodes.filter(n => !have.has(pp.sectionHash(n)))
    if (!todo.length) return
    stats.units++
    stats.sections += todo.length
    const fresh = new Map<string, Section>()
    // Разделы — пачками по BATCH: пул «думает», и на длинном юните рассуждение съедает бюджет до конца JSON
    // (finish=length). Пустой/обрезанный ответ — до EMPTY_RETRIES повторов, потом пачка остаётся дословной.
    for (let from = 0; from < todo.length; from += BATCH) {
      const batch = todo.slice(from, from + BATCH)
      const { system, user } = pp.buildPrompt(locale, a.title, batch.map((n, id) => ({ id, heading: n.heading, theses: n.points.map(p => p.text) })))
      let parsed: Map<number, string[]> | null = null
      let last = { content: '', finish: '—' }
      let transport = false
      for (let attempt = 1; attempt <= EMPTY_RETRIES && !parsed; attempt++) {
        try {
          last = await callGateway(key, system, user)
          parsed = pp.parseReply(last.content)
        } catch (e) {
          stats.transport++
          transport = true
          console.error(`GATEWAY ${at}: ${(e as Error).message} — ${batch.length} разд. остались дословными`)
          break
        }
      }
      if (!parsed) {
        if (transport) continue // уже посчитан и напечатан выше
        stats.empty += batch.length
        console.error(`NO-PARAPHRASE ${at}: ответ пуст или не JSON (finish=${last.finish}, ${last.content.length} знаков) — ${batch.length} разд. остались дословными`)
        report.push({ unit: at, heading: '', verbatim: [], points: [], findings: [`пустой/битый ответ, finish=${last.finish}`], raw: last.content.slice(0, 4000) })
        continue
      }
      batch.forEach((n, id) => {
        const pts = parsed.get(id) ?? []
        const findings = pts.length ? pp.checkParaphraseSection(pts, n, mdx, locale, rules) : ['модель не вернула раздел']
        report.push({ unit: at, heading: n.heading, verbatim: n.points.map(p => p.text), points: pts, findings })
        if (findings.length) {
          stats.rejected++
          for (const f of findings) {
            const r = f.replace(/«[^»]*»|`[^`]*`|\d+/g, '…')
            reasons.set(r, (reasons.get(r) ?? 0) + 1)
          }
        } else {
          stats.accepted++
          const settled = pp.settleSection(n, pts)
          if (settled.verbatim) stats.near++
          fresh.set(settled.sourceHash, settled)
        }
      })
    }
    // Каждый юнит обрабатывает ровно один воркер — гонки за файл нет.
    const prevSections = new Map((a.paraphrase?.sections ?? []).filter(s => have.has(s.sourceHash)).map(s => [s.sourceHash, s]))
    const sections = nodes.flatMap(n => {
      const h = pp.sectionHash(n)
      const sec = fresh.get(h) ?? prevSections.get(h)
      return sec ? [sec] : []
    })
    const next: Artifact = { ...a }
    delete next.paraphrase
    if (sections.length) next.paraphrase = { source: 'paraphrase', generator: pp.PARAPHRASE_GENERATOR, pool: pp.PARAPHRASE_POOL, sections }
    const json = serialize(next)
    if (json !== readFileSync(file, 'utf8')) writeFileSync(file, json, 'utf8')
  }

  const queue = [...targets]
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) await work(job)
  }))

  if (reportPath) writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8')
  console.log(`paraphrase: юнитов с вызовом ${stats.units}, разделов ${stats.sections} — прошли гвард ${stats.accepted} (из них почти дословных, не хранятся: ${stats.near}), отброшены гвардом ${stats.rejected}, пустой/битый ответ ${stats.empty}, отказ транспорта (юнитов) ${stats.transport}`)
  for (const [r, n] of [...reasons].sort((x, y) => y[1] - x[1])) console.log(`  отброшено: ${n} × ${r}`)
  if (stats.transport || stats.empty) console.error('ПЕРЕСКАЗ НЕПОЛНЫЙ: часть разделов осталась дословной не по решению гварда, а из-за гейтвея — перезапусти --paraphrase')
  return stats.transport || stats.empty ? 3 : 0
}

let code = failed || tally.skipped ? 1 : 0
if (paraphrase) {
  const pcode = await paraphraseAll()
  if (!code) code = pcode
}
process.exit(code)
