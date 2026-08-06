// web/lib/intake/parse-outcome.ts
// Extract the learner's free-text desired outcome (F3) from an intake profile.
// `profile.answers` may arrive as a JSON string or an already-parsed object; F3 is optional.
export function parseOutcome(profile: { answers?: unknown } | null | undefined): string | null {
  try {
    const raw = profile?.answers
    const a = typeof raw === 'string' ? JSON.parse(raw) : raw
    const f3 = (a as Record<string, unknown> | null | undefined)?.F3
    return typeof f3 === 'string' ? f3 : null
  } catch {
    return null
  }
}
