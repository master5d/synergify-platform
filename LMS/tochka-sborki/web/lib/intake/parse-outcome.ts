// web/lib/intake/parse-outcome.ts
// Extract the learner's free-text desired outcome from an intake profile.
// Новая анкета пишет его в V_OUTCOME, старая (v1) — в F3; приоритет у нового ключа, F3 — фолбэк.
// `profile.answers` may arrive as a JSON string or an already-parsed object; both keys are optional.
// Пустое / пробельное значение считается отсутствующим. Без импортов — файл нейтрален к алиасам.
const OUTCOME_KEYS = ['V_OUTCOME', 'F3'] as const

export function parseOutcome(profile: { answers?: unknown } | null | undefined): string | null {
  try {
    const raw = profile?.answers
    const a = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<string, unknown> | null | undefined
    for (const key of OUTCOME_KEYS) {
      const v = a?.[key]
      if (typeof v === 'string' && v.trim()) return v.trim()
    }
    return null
  } catch {
    return null
  }
}
