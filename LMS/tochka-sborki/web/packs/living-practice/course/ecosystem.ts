// packs/living-practice/course/ecosystem.ts
// Форма эталона. Узлы честные: что есть у курса сейчас (уроки, материалы),
// что planned на уровне академии. Ничего не обещаем сверх статуса planned.
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
    ru: 'Что вокруг курса — с одного взгляда',
    en: 'What surrounds the course at a glance',
  },
  pillars: [
    {
      key: 'learn',
      title: { ru: 'Читай', en: 'Read' },
      nodes: [
        { label: { ru: 'Курс (6 уроков)', en: 'Course (6 lessons)' }, status: 'live' },
        { label: { ru: 'Памятка и карта курса', en: 'Pocket list & course map' }, status: 'live' },
        { label: { ru: 'Манифест академии', en: 'The academy manifesto' }, status: 'live' },
      ],
    },
    {
      key: 'connect',
      title: { ru: 'Связывайся', en: 'Connect' },
      nodes: [
        { label: { ru: 'Свой круг практики (ИГИ)', en: 'Your practice circle (IGI)' }, status: 'planned' },
        { label: { ru: 'Сообщество S.A.S.H.A', en: 'S.A.S.H.A community' }, status: 'planned' },
        { label: { ru: 'AMA office-hours', en: 'AMA office-hours' }, status: 'planned' },
      ],
    },
    {
      key: 'prove',
      title: { ru: 'Отмечай', en: 'Mark' },
      nodes: [
        { label: { ru: 'Сертификат о прочтении', en: 'Completion certificate' }, status: 'live' },
        { label: { ru: 'Золотой билет в академию', en: 'Academy admission ticket' }, status: 'planned' },
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
