// lib/authoring/outline-io.ts
// Ф2 S2: generic outline для research/draft/orchestrate CLI — до этого они были
// прибиты к SAMPLE_OUTLINE и не видели гостевые/новые курсы.
// loadOutline — единственная I/O-точка (JSON-файл → валидный CourseOutline,
// понятные ошибки); moduleOutlineToCourseOutline — pure-мост: модуль мастера =
// курс из одного модуля, чтобы research/draft-туллинг работал и для wizard'а.
import { readFileSync } from 'node:fs'
import type { Bi } from '@/lib/course'
import { validateOutline } from './outline'
import type { CourseOutline } from './outline'
import type { ModuleOutline as WizardModuleOutline } from './module-outline'

/** Читает и валидирует CourseOutline из JSON-файла. Бросает Error с понятным
 *  сообщением: файл не читается / не JSON / не проходит validateOutline. */
export function loadOutline(path: string): CourseOutline {
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch (e) {
    throw new Error(`cannot read outline file "${path}": ${(e as Error).message}`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    throw new Error(`outline "${path}" is not valid JSON: ${(e as Error).message}`)
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`outline "${path}" must be a JSON object matching CourseOutline (see lib/authoring/outline.ts)`)
  }

  const outline = parsed as CourseOutline
  const errors = validateOutline(outline)
  if (errors.length) {
    throw new Error(
      `outline "${path}" is invalid:\n` + errors.map(e => `  - ${e}`).join('\n'),
    )
  }
  return outline
}

/** Мост: outline гостевого модуля (module-pack wizard) → курс из одного модуля,
 *  чтобы research/draft/orchestrate-туллинг работал поверх него без изменений. */
export function moduleOutlineToCourseOutline(mo: WizardModuleOutline, courseName: Bi): CourseOutline {
  return {
    name: courseName,
    modules: [
      {
        slug: mo.slug,
        title: mo.title,
        description: mo.description,
        level: 1,
        units: mo.units.map(u => ({ slug: u.slug, title: u.title, objective: u.objective })),
      },
    ],
  }
}

/** Вырезает `--outline <path>` из argv. Возвращает путь (если флаг был) и
 *  остальные аргументы в исходном порядке. Бросает, если флаг без значения. */
export function extractOutlineOption(argv: string[]): { outlinePath?: string; rest: string[] } {
  const i = argv.indexOf('--outline')
  if (i < 0) return { rest: argv }
  const outlinePath = argv[i + 1]
  if (!outlinePath || outlinePath.startsWith('--')) {
    throw new Error('--outline requires a <path.json> argument')
  }
  return { outlinePath, rest: [...argv.slice(0, i), ...argv.slice(i + 2)] }
}
