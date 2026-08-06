import type { Locale } from '@/lib/dictionaries'

export type PhaseType = 'activation' | 'reflection' | 'concept' | 'practice'

export const PHASE_META: Record<PhaseType, { label: Record<Locale, string>; kolb: Record<Locale, string>; icon: string; color: string }> = {
  activation: { label: { ru: 'Активация', en: 'Activation' }, kolb: { ru: 'Колб: конкретный опыт',              en: 'Kolb: concrete experience' },        icon: '⚡', color: 'var(--phase-1)' },
  reflection: { label: { ru: 'Рефлексия', en: 'Reflection' }, kolb: { ru: 'Колб: рефлексивное наблюдение',      en: 'Kolb: reflective observation' },      icon: '👁', color: 'var(--phase-2)' },
  concept:    { label: { ru: 'Концепция', en: 'Concept' },    kolb: { ru: 'Колб: абстрактная концептуализация', en: 'Kolb: abstract conceptualization' },  icon: '💡', color: 'var(--phase-3)' },
  practice:   { label: { ru: 'Практика', en: 'Practice' },    kolb: { ru: 'Колб: активный эксперимент',          en: 'Kolb: active experimentation' },      icon: '🛠', color: 'var(--phase-4)' },
}

const MENTAL_MARKER: Record<Locale, string> = {
  ru: '💭 в уме · писать не нужно',
  en: '💭 in your head · nothing to type',
}

const MENTAL_PHASES: ReadonlySet<PhaseType> = new Set<PhaseType>(['activation', 'reflection'])

export function phaseLabel(type: PhaseType, locale: Locale): string {
  return PHASE_META[type].label[locale]
}

export function phaseKolb(type: PhaseType, locale: Locale): string {
  return PHASE_META[type].kolb[locale]
}

export function phaseMarker(type: PhaseType, locale: Locale): string | null {
  return MENTAL_PHASES.has(type) ? MENTAL_MARKER[locale] : null
}
