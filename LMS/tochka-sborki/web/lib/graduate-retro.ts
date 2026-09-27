// Логика ретро выпускника (intake LMS#10, по мотивам glebis/claude-skills/lab-retro, MIT),
// вынесена из components/graduate-retro-form.tsx для тестируемости — репо не ставит
// jsdom/testing-library, тесты компонентов рендерят только статику (react-dom/server),
// а сетевые сценарии проверяются на этой чистой функции с подставным fetch
// (тот же приём, что lib/login-flow.ts / lib/auth-check.ts).

/** Отдельная строка в course_feedback, не связанная с конкретным модулем. */
export const RETRO_LESSON_KEY = 'graduate-retro'

export interface RetroFields {
  before: string
  after: string
  prompt: string
  plan: string
  review: string
}

export type RetroFieldKey = keyof RetroFields

export const RETRO_FIELD_KEYS: RetroFieldKey[] = ['before', 'after', 'prompt', 'plan', 'review']

export const EMPTY_RETRO_FIELDS: RetroFields = { before: '', after: '', prompt: '', plan: '', review: '' }

/** Все четыре вопроса — обязательные (иначе ретро теряет смысл); возвращает пустые поля. */
export function validateRetro(fields: RetroFields): RetroFieldKey[] {
  return RETRO_FIELD_KEYS.filter(key => !fields[key].trim())
}

/** `/api/auth/me` не отвечает 200 или не несёт email → блок не показываем (только вошедшему). */
export async function fetchIsGraduate(fetchImpl: typeof fetch): Promise<boolean> {
  try {
    const res = await fetchImpl('/api/auth/me', { credentials: 'include' })
    if (!res.ok) return false
    const data: { email?: string } = await res.json().catch(() => ({}))
    return Boolean(data.email)
  } catch {
    return false
  }
}

export type SubmitRetroResult = { ok: true } | { ok: false }

/** Переиспользует существующий /api/feedback (course_feedback): отзыв — в `other`,
 *  остальные три поля — в новые nullable-колонки retro_* (миграция 0017). */
export async function submitRetro(
  fetchImpl: typeof fetch,
  fields: RetroFields,
  locale: string,
): Promise<SubmitRetroResult> {
  try {
    const res = await fetchImpl('/api/feedback', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson: RETRO_LESSON_KEY,
        other: fields.review,
        locale,
        retroBefore: fields.before,
        retroAfter: fields.after,
        retroPrompt: fields.prompt,
        retroPlan: fields.plan,
      }),
    })
    return res.ok ? { ok: true } : { ok: false }
  } catch {
    return { ok: false }
  }
}

export interface RetroMarkdownMeta {
  name: string
  date: string
}

export interface RetroMarkdownLabels {
  beforeLabel: string
  afterLabel: string
  planLabel: string
}

/** «План на месяц» и «до/после» уходят студенту своим файлом — ретро остаётся у него,
 *  а не только в course_feedback (лучший промпт и отзыв в файл не идут, они — только нам). */
export function buildRetroMarkdown(
  fields: Pick<RetroFields, 'before' | 'after' | 'plan'>,
  meta: RetroMarkdownMeta,
  labels: RetroMarkdownLabels,
): string {
  const lines = [
    `# ${meta.name ? `${meta.name} — ` : ''}${meta.date}`,
    '',
    `## ${labels.beforeLabel}`,
    fields.before.trim(),
    '',
    `## ${labels.afterLabel}`,
    fields.after.trim(),
    '',
    `## ${labels.planLabel}`,
    fields.plan.trim(),
    '',
  ]
  return lines.join('\n')
}
