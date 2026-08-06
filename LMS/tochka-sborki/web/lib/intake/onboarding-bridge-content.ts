import type { WorldSkin, Locale } from '@/lib/intake/types'
import { skinDecoder } from '@/lib/rpg/skins-meta'
import { HELP_TIPS } from '@/lib/help/help-content'

export interface BridgeGlossaryItem { icon: string; term: string; desc: string }
export interface BridgeContent {
  title: string
  decoder: string
  glossary: BridgeGlossaryItem[]
  reassurance: string
  enterLabel: string
}

const T = {
  title:       { ru: 'Прежде чем войти', en: 'Before you enter' },
  reassurance: { ru: 'Ты проходишь курс. Игровая обёртка — чтобы было живее; её можно игнорировать.', en: "You're taking a course. The game wrapper is there to make it livelier — you can ignore it." },
  enter:       { ru: 'Понятно, войти →', en: 'Got it, enter →' },
  terms: {
    shards:    { ru: 'шарды', en: 'shards' },
    mode:      { ru: 'режим', en: 'mode' },
    map:       { ru: 'карта', en: 'map' },
    challenge: { ru: 'прикладной вызов', en: 'applied challenge' },
    dungeon:   { ru: 'подземелье', en: 'dungeon' },
  },
  challengeDesc: { ru: 'Практическое задание в конце юнита — под твою нишу и цель.', en: 'A hands-on task at the end of a unit — tailored to your niche and goal.' },
} as const

export function buildBridgeContent(skin: WorldSkin, locale: Locale): BridgeContent {
  const glossary: BridgeGlossaryItem[] = [
    { icon: '💎', term: T.terms.shards[locale],    desc: HELP_TIPS['shards'].body[locale] },
    { icon: '🎚', term: T.terms.mode[locale],      desc: HELP_TIPS['wizard-modes'].body[locale] },
    { icon: '🗺', term: T.terms.map[locale],       desc: HELP_TIPS['world-map'].body[locale] },
    { icon: '🎯', term: T.terms.challenge[locale], desc: T.challengeDesc[locale] },
    { icon: '🏛', term: T.terms.dungeon[locale],   desc: HELP_TIPS['dungeon-card'].body[locale] },
  ]
  return {
    title: T.title[locale],
    decoder: skinDecoder(skin, locale),
    glossary,
    reassurance: T.reassurance[locale],
    enterLabel: T.enter[locale],
  }
}
