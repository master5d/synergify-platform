// packs/one-to-one/course/ecosystem.ts
// Форма эталона. Узлы честные: что есть у курса сейчас (уроки, шаблоны, расчёт академии),
// что planned (инструменты подпроектов B/C, сообщество). Ничего не обещаем сверх статуса planned.
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
        { label: { ru: 'Курс (14 уроков, четыре артефакта)', en: 'Course (14 lessons, four outputs)' }, status: 'live' },
        { label: { ru: 'Шпаргалка и карта курса', en: 'Cheat sheet & course map' }, status: 'live' },
        { label: { ru: 'Шаблоны для практики', en: 'Templates for practice' }, status: 'live' },
      ],
    },
    {
      key: 'connect',
      title: { ru: 'Связывайся', en: 'Connect' },
      nodes: [
        { label: { ru: 'Сообщество S.A.S.H.A', en: 'S.A.S.H.A community' }, status: 'planned' },
        { label: { ru: 'AMA office-hours', en: 'AMA office-hours' }, status: 'planned' },
      ],
    },
    {
      key: 'prove',
      title: { ru: 'Шагай', en: 'Step' },
      nodes: [
        { label: { ru: 'Лесенка форматов и «Моя карта»', en: 'Format ladder and “My map”' }, status: 'live' },
        { label: { ru: 'Курсы следующих ступеней', en: 'Courses for the next steps' }, status: 'planned' },
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
