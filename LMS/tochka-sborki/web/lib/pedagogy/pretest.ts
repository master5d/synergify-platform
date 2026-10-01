// Pretest в активации (intake LMS#20, Педагогика 2; Pan & Carpenter 2023): 1–2 самопроверки юнита
// до объяснения — «угадай, ошибаться можно». Помогает, только если потом показан правильный ответ,
// поэтому в pretest идут лишь вопросы, чья метка <SelfCheck id/> стоит в фазе concept этого урока:
// там ученик ответит ещё раз и увидит ответ с объяснением. До концепта ответ наружу не уходит —
// клиент получает PretestItem без answer/explain.
//
// Выбор вопросов — данные, не MDX:
//  • по умолчанию — первый вопрос юнита (порядок checks в _meta.json), размеченный в концепте;
//  • `_meta.json` → `"pretest": { "<unit>": ["c3", "c4"] }` — явный выбор автора (до двух),
//    `[]` — pretest у этого урока выключен.
import type { ModuleMeta, SelfCheckItem } from '../content'
import { selfCheckMarks } from '../content/alignment'

export const PRETEST_MAX = 2

/** Что видит ученик до объяснения: вопрос и варианты. Ни ответа, ни объяснения. */
export interface PretestItem { id: string; question: string; options: string[] }

const CONCEPT_RE = /<Phase\s+type="concept"\s*>([\s\S]*?)<\/Phase>/g

/** Текст фазы concept урока (все её блоки подряд). */
export function conceptBlock(mdx: string): string {
  return [...mdx.matchAll(CONCEPT_RE)].map(m => m[1]).join('\n')
}

/** Самопроверки юнита, пригодные для pretest: их ответ ученик увидит в концепте. */
export function pretestCandidates(checks: SelfCheckItem[] | undefined, unit: string, mdx: string): SelfCheckItem[] {
  const inConcept = new Set(selfCheckMarks(conceptBlock(mdx)).ids)
  return (checks ?? []).filter(c => c.unit === unit && inConcept.has(c.id))
}

export function pickPretest(meta: Pick<ModuleMeta, 'checks' | 'pretest'>, unit: string, mdx: string): SelfCheckItem[] {
  const ok = pretestCandidates(meta.checks, unit, mdx)
  const chosen = meta.pretest?.[unit]
  if (chosen === undefined) return ok.slice(0, 1)
  return chosen.flatMap(id => ok.filter(c => c.id === id)).slice(0, PRETEST_MAX)
}

export function toPretestItem(c: SelfCheckItem): PretestItem {
  return { id: c.id, question: c.question, options: [...c.options] }
}

/** Гвард явного выбора автора: вопрос свой, размечен в концепте, не больше двух. */
export function pretestErrors(at: string, meta: Pick<ModuleMeta, 'checks' | 'pretest' | 'units'>, mdxOf: (unit: string) => string | null): string[] {
  const out: string[] = []
  for (const [unit, ids] of Object.entries(meta.pretest ?? {})) {
    if (!meta.units.some(u => u.slug === unit)) { out.push(`${at}: pretest для урока ${unit}, которого нет`); continue }
    if (ids.length > PRETEST_MAX) out.push(`${at}: pretest ${unit} — ${ids.length} вопросов, не больше ${PRETEST_MAX}`)
    const mdx = mdxOf(unit) ?? ''
    const ok = new Set(pretestCandidates(meta.checks, unit, mdx).map(c => c.id))
    for (const id of ids) if (!ok.has(id)) out.push(`${at}: pretest ${unit} → ${id}: не вопрос этого урока или его метка не в фазе concept`)
  }
  return out
}
