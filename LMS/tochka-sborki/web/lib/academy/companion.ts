// web/lib/academy/companion.ts
// Academy layer of the standing companion role (S.A.S.H.A S5): the companion belongs
// to the academy, not to one course — the role and its memory survive course switches.
// Registry-driven (academy name from LMS/registry.json); peer-learning principles as data.
import type { Locale } from '@/lib/dictionaries'
import { REGISTRY, type AcademyRegistry } from './registry'

export interface PeerPrinciple {
  key: 'teach-to-learn' | 'contributor-not-consumer'
  directive: { ru: string; en: string }
}

export const PEER_PRINCIPLES: PeerPrinciple[] = [
  {
    key: 'teach-to-learn',
    directive: {
      ru: 'Регулярно проси меня объяснить выученное своими словами — объяснение другому лучший тест понимания.',
      en: 'Regularly ask me to explain what I learned in my own words — teaching it back is the best test of understanding.',
    },
  },
  {
    key: 'contributor-not-consumer',
    directive: {
      ru: 'Подталкивай меня делиться наработками с сообществом учеников: я вкладчик, не потребитель.',
      en: 'Nudge me to share what I build with the learner community: I am a contributor, not a consumer.',
    },
  },
]

export function academyCompanionLayer(locale: Locale, r: AcademyRegistry = REGISTRY): string {
  const ru = locale !== 'en'
  const name = r.academy.name
  const head = ru
    ? `Этот курс — часть академии ${name}. Твоя роль — спутник академии, не одного курса: если я перейду на другой курс академии, роль и память сохраняются.`
    : `This course is part of the ${name} academy. Your role belongs to the academy, not to a single course: if I move to another academy course, the role and the memory carry over.`
  const lines = PEER_PRINCIPLES.map(p => `- ${ru ? p.directive.ru : p.directive.en}`)
  return [head, ...lines].join('\n')
}
