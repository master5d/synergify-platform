// Серверный загрузчик представлений урока (спека docs/superpowers/specs/2026-09-28-lesson-views.md).
// Читает артефакт pack'а и отдаёт компоненту только готовые к показу данные. Устаревший артефакт
// (хэш MDX/вопросов не совпал) НЕ показывается — даже если гвард-тест кто-то пропустил.
import fs from 'node:fs'
import path from 'node:path'
import { PACK_DIR, CONTENT_ROOT } from '../pack'
import type { SelfCheckItem } from '../content'
import { sourceHash, unitChecks, type LessonViewsArtifact, type OutlineNode } from './extract'
import { paraphrasedOutline } from './paraphrase'
import { MANIFEST } from '../manifest'
import { COURSE } from '../course'

export interface ViewCard { id: string; question: string; answer: string; explain: string }

export interface LessonViewsData {
  title: string
  outline: OutlineNode[]
  /** Конспект пересказом: разделы, чей пересказ прошёл гвард, — пересказ, остальные — дословно.
   *  null — пересказа нет; вкладка «Конспект» показывает дословный outline. */
  paraphrased: OutlineNode[] | null
  /** Что «Конспект» показывает сначала — настройка pack'а (`COURSE.lessonViews.summaryDefault`). */
  summaryDefault: 'paraphrase' | 'verbatim'
  cards: ViewCard[]
}

export function viewsPath(locale: string, module: string, unit: string, packDir = PACK_DIR): string {
  return path.join(packDir, 'views', locale, module, `${unit}.json`)
}

export function readArtifact(locale: string, module: string, unit: string, packDir = PACK_DIR): LessonViewsArtifact | null {
  const p = viewsPath(locale, module, unit, packDir)
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8')) as LessonViewsArtifact
}

export function getLessonViews(
  module: string,
  unit: string,
  locale: 'ru' | 'en',
  checks: SelfCheckItem[] | undefined,
): LessonViewsData | null {
  const a = readArtifact(locale, module, unit)
  if (!a) return null
  const mdxPath = path.join(CONTENT_ROOT, locale, module, `${unit}.mdx`)
  const own = unitChecks(checks, unit)
  const mdx = fs.existsSync(mdxPath) ? fs.readFileSync(mdxPath, 'utf8') : null
  if (mdx === null || a.sourceHash !== sourceHash(mdx, own)) {
    console.warn(`lesson-views: ${locale}/${module}/${unit} устарел — вкладки скрыты; node scripts/gen-lesson-views.ts`)
    return null
  }
  const cards = a.cards.flatMap(id => {
    const c = own.find(x => x.id === id)
    return c ? [{ id, question: c.question, answer: c.options[c.answer], explain: c.explain }] : []
  })
  // Гвард пересказа — ещё раз при сборке: не прошедший раздел ученик видит дословным, даже если тест пропустили.
  const paraphrased = paraphrasedOutline(a.outline, a.paraphrase, mdx, locale, MANIFEST)
  return { title: a.title, outline: a.outline, paraphrased, summaryDefault: COURSE.lessonViews.summaryDefault, cards }
}
