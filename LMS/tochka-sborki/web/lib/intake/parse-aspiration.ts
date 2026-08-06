// web/lib/intake/parse-aspiration.ts
// Extract the learner's aspirational figure (G11) from an intake profile.
// `profile.answers` may be a JSON string or an already-parsed object; G11 is optional.
export function parseAspiration(profile: { answers?: unknown } | null | undefined): string | null {
  try {
    const raw = profile?.answers
    const a = typeof raw === 'string' ? JSON.parse(raw) : raw
    const g11 = (a as Record<string, unknown> | null | undefined)?.G11
    return typeof g11 === 'string' && g11.trim() ? g11 : null
  } catch {
    return null
  }
}
