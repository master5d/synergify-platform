// web/lib/course/ecosystem.ts
// Course-data for the Learn/Connect/Prove ecosystem diagram. Engine component is generic
// (components/ecosystem-diagram.tsx); these nodes are specific to Точка Сборки.
import type { Locale } from '@/lib/intake/types'

export type NodeStatus = 'live' | 'planned'
export interface EcoNode { label: string; desc?: string; status: NodeStatus }
export interface EcoPillar { key: 'learn' | 'connect' | 'prove'; title: string; nodes: EcoNode[] }
export interface EcosystemData { eyebrow: string; heading: string; pillars: EcoPillar[] }

interface Bi { ru: string; en: string }
interface RawNode { label: Bi; desc?: Bi; status: NodeStatus }
interface RawPillar { key: 'learn' | 'connect' | 'prove'; title: Bi; nodes: RawNode[] }
interface RawEco { eyebrow: Bi; heading: Bi; pillars: RawPillar[] }

const RAW: RawEco = {
  eyebrow: { ru: 'Экосистема', en: 'Ecosystem' },
  heading: {
    ru: 'Вся поддержка курса — с одного взгляда',
    en: 'The whole support system at a glance',
  },
  pillars: [
    {
      key: 'learn',
      title: { ru: 'Учись', en: 'Learn' },
      nodes: [
        { label: { ru: 'Курс (9 модулей)', en: 'Course (9 modules)' }, status: 'live' },
        { label: { ru: 'AI-напарник', en: 'AI companion' }, status: 'live' },
        { label: { ru: 'Учиться с ИИ', en: 'Learn with AI' }, status: 'live' },
        { label: { ru: 'Материалы и программа', en: 'Materials & syllabus' }, status: 'live' },
      ],
    },
    {
      key: 'connect',
      title: { ru: 'Связывайся', en: 'Connect' },
      nodes: [
        { label: { ru: 'Сообщество S.A.S.H.A', en: 'S.A.S.H.A community' }, status: 'planned' },
        { label: { ru: 'Кросс-курс companion', en: 'Cross-course companion' }, status: 'planned' },
        { label: { ru: 'AMA office-hours', en: 'AMA office-hours' }, status: 'planned' },
        { label: { ru: '1:1 наставничество', en: '1:1 mentorship' }, status: 'live' },
      ],
    },
    {
      key: 'prove',
      title: { ru: 'Доказывай', en: 'Prove' },
      nodes: [
        { label: { ru: 'Сертификат', en: 'Certificate' }, status: 'live' },
        { label: { ru: 'Золотой билет в академию', en: 'Academy admission ticket' }, status: 'planned' },
        { label: { ru: 'Портфолио-витрина', en: 'Showcase portfolio' }, status: 'planned' },
      ],
    },
  ],
}

export function getEcosystem(locale: Locale): EcosystemData {
  const k: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  return {
    eyebrow: RAW.eyebrow[k],
    heading: RAW.heading[k],
    pillars: RAW.pillars.map((p) => ({
      key: p.key,
      title: p.title[k],
      nodes: p.nodes.map((n) => ({
        label: n.label[k],
        desc: n.desc ? n.desc[k] : undefined,
        status: n.status,
      })),
    })),
  }
}
