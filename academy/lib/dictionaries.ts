import type { Locale } from './registry'

export type { Locale }

export interface AcademyDictionary {
  academy: {
    eyebrow: string
    wordmark: string
    fullName: string
    positioning: string[]
    gate: string
    gateCta: string
    charterLabel: string
    coursesLabel: string
    comingSoon: string
    metaTitle: string
    metaDescription: string
  }
}

export const dictionaries: Record<Locale, AcademyDictionary> = {
  ru: {
    academy: {
      eyebrow: 'академия',
      wordmark: 'S.A.S.H.A',
      fullName: 'Synergema Authentica Starseed Holon Academy',
      positioning: [
        'Мы строим школу, которую сами искали много лет — и, не находя, называли по-разному: гильдия, тёплое пространство, синергема. Семь лет одна и та же мысль искала имя: людям не хватает не знаний, а живых связей, в которых знание становится силой.',
        'Синергема — наше слово для такой связи: syn + ergon + ema, плод совместной работы. Мы устроены как кристалл: чем больше отражений с другими, тем больше правды о себе. Поэтому здесь не учатся в одиночку — здесь собираются.',
        'Синергема ткётся, а не строится: каждый вплетает свою нить, но узор больше любой из них. Мы делаем свой шаг — и даём узору дозреть; здесь не тянут силой то, что сходится само.',
        'В академию нельзя записаться — в неё можно только войти, пройдя «Точку Сборки». Не потому, что мы любим закрытые двери: система не тратит силу на то, что внутри здания, пока кто-то не пожелает туда войти. Сначала собери свою точку — потом учись её двигать.',
        'Внутри — работа: практики внимания и состояний, групповые ритуалы инсайта, ремесло совместного мышления — с ИИ и без него. Способности здесь куются, а не изучаются. Мы не обещаем сверхспособностей и не продаём тайну. Каждый третий хотя бы раз переживал опыт, который некуда было отнести, — сюда можно.',
        'Школа удалась, когда перестала быть нужной: мы растим самостоятельных, не адептов. Курс бесплатный, вход заслуженный, дверь открыта столько, сколько тебе нужно.',
      ],
      gate: 'Вход в академию открывается после прохождения «Точки Сборки».',
      gateCta: 'Пройти Точку Сборки →',
      charterLabel: 'Правила дома — чем мы отвечаем →',
      coursesLabel: 'Курсы',
      comingSoon: 'скоро',
      metaTitle: 'S.A.S.H.A — школа синергемы',
      metaDescription: 'Закрытая школа живых связей. Вход — через открытый курс «Точка Сборки». Способности куются, а не изучаются.',
    },
  },
  en: {
    academy: {
      eyebrow: 'academy',
      wordmark: 'S.A.S.H.A',
      fullName: 'Synergema Authentica Starseed Holon Academy',
      positioning: [
        'We are building the school we spent years looking for — and, never finding it, kept naming differently: a guild, a warm space, a synergema. For seven years one thought kept searching for its name: what people lack is not knowledge, but living connections in which knowledge becomes strength.',
        'Synergema is our word for such a connection: syn + ergon + ema — the fruit of working together. We are built like a crystal: the more reflections we share with others, the more truth we see about ourselves. So no one studies here alone — here, we assemble.',
        'A synergema is woven, not built: each of us weaves in a thread, yet the pattern is larger than any single one. We take our step — and let the pattern ripen; no one here forces what comes together on its own.',
        'You cannot sign up for the academy — you can only enter it, by completing Tochka Sborki. Not because we like closed doors: a system spends no strength on what is inside a building until someone wishes to walk in. First assemble your point of assembly — then learn to move it.',
        'Inside is work: practices of attention and state, group insight rituals, the craft of thinking together — with AI and without it. Powers here are forged rather than studied. We promise no superpowers and sell no secrets. One person in three has lived through an experience they had nowhere to bring — here, you can bring it.',
        'The school has succeeded when it is no longer needed: we raise the independent, not adepts. The course is free, admission is earned, and the door stays open for as long as you need it.',
      ],
      gate: 'Admission opens after completing Tochka Sborki.',
      gateCta: 'Take Tochka Sborki →',
      charterLabel: 'House rules — what we answer for →',
      coursesLabel: 'Courses',
      comingSoon: 'coming soon',
      metaTitle: 'S.A.S.H.A — the synergema school',
      metaDescription: 'A gated school of living connections. The way in is the open course Tochka Sborki. Powers are forged rather than studied.',
    },
  },
}

export function getDictionary(locale: Locale): AcademyDictionary {
  return dictionaries[locale]
}
