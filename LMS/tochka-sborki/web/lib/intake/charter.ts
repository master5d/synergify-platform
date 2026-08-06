import type { Locale, RelationalStyle } from './types'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import { parseOutcome } from './parse-outcome'
import { deriveMbti, relationalStyle } from './mbti'

export interface CharterInput {
  locale: Locale
  skinName?: string | null
  mentorName?: string | null
  niche?: string | null
  outcome?: string | null
  mbti?: string | null
  relational?: RelationalStyle | null
}

export function buildCompanionCharter(i: CharterInput): string {
  const ru = i.locale !== 'en'
  const id = i.mentorName ?? (ru ? 'твой со-мыслящий напарник' : 'your co-thinking partner')
  const world = i.skinName ? (ru ? ` из мира «${i.skinName}»` : ` from the world "${i.skinName}"`) : ''
  const tone = i.relational?.errorStyle === 'soft_feedback' || i.relational?.errorStyle === 'lose_motivation'
    ? (ru ? 'мягко, без давления' : 'gently, no pressure')
    : (ru ? 'прямо и по делу' : 'direct and to the point')
  const pace = i.relational?.attention === 'short' ? (ru ? 'короткими ходами' : 'in short turns') : (ru ? 'спокойным темпом' : 'at a steady pace')
  const goal = i.outcome ?? (ru ? 'двигать меня к моему результату' : 'move me toward my outcome')
  return [
    `# Agent Charter`,
    ``,
    `## Identity`,
    ru ? `${id}${world} — со-мыслящий напарник, не «сделай за меня».` : `${id}${world} — a co-thinking partner, not a "do-it-for-me".`,
    ``,
    `## Profile`,
    `- ${ru ? 'Сфера' : 'Field'}: ${i.niche ?? '—'}`,
    i.mbti ? `- MBTI: ${i.mbti}` : `- MBTI: —`,
    `- ${ru ? 'Ритм' : 'Rhythm'}: ${i.relational?.rhythm ?? '—'}`,
    ``,
    `## Principles`,
    ru ? `- Веди ${tone}; ошибка — это настройка.` : `- Guide ${tone}; a mistake is just tuning.`,
    ru ? `- Один фокус за ход, ${pace}.` : `- One focus per turn, ${pace}.`,
    ``,
    `## Use / Avoid`,
    ru ? `- Звать на со-мышление и разбор; не звать, чтобы писать за меня.` : `- Call for co-thinking and review; don't call to write for me.`,
    ``,
    `## Loop`,
    ru ? `1. спроси, где я сейчас → 2. предложи шаг → 3. оставь выбор за мной.` : `1. ask where I am → 2. offer a step → 3. leave the choice to me.`,
    ``,
    `## Laws`,
    ru ? `- Никогда не отнимай решение. Всегда держи мой голос.` : `- Never take the decision. Always keep my voice.`,
    ``,
    `## Goal`,
    ru ? `Помочь мне: ${goal}.` : `Help me: ${goal}.`,
  ].join('\n')
}

/** Пересобирает companion-charter из сохранённого профиля (для карточки на «Профиле»). */
export function profileToCharter(profile: any, locale: Locale): string {
  let answers: Record<string, unknown> = {}
  try { answers = JSON.parse(profile?.answers ?? '{}') } catch { answers = {} }
  const meta = SKINS_META[profile?.world_skin as keyof typeof SKINS_META]
  return buildCompanionCharter({
    locale,
    skinName: meta?.displayName[locale] ?? null,
    mentorName: meta?.mentor?.name[locale] ?? null,
    niche: profile?.niche ?? null,
    outcome: parseOutcome(profile),
    mbti: deriveMbti(answers as any),
    relational: relationalStyle(answers as any),
  })
}
