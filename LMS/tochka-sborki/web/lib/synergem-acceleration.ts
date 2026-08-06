// lib/synergem-acceleration.ts
// Синергема acceleration (fb_daa79c). A sovereign self-run progression ladder: the stages a
// синергема grows through, from gathering to autonomy. Engine + keyed bilingual data (mirror
// lib/igi.ts); the presentational card is components/synergem-acceleration.tsx. No backend, no
// hosted LLM, no membership state — a formed cluster reads it together and self-navigates.
// Resources are self-sourced by the group, never owner-dispensed. Every string is de-hustle clean
// (lib/synergem-acceleration.test.ts asserts lintDehustle []). The ladder ends in autonomy —
// graduation, not retention — echoing lib/mentor-persona.ts.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export interface AccelStage {
  key: string
  name: Bi       // stage name
  milestone: Bi  // what defines this stage — where the cluster is
  readiness: Bi  // "ready for the next stage when…" self-check
  move: Bi       // one concrete move to grow through the stage
}

export interface Acceleration {
  intro: Bi
  stages: AccelStage[]
}

export const ACCELERATION: Acceleration = {
  intro: {
    ru: 'Лестница роста синергемы: путь от «собрались» до автономии. Читайте вместе, сверяйте, где вы сейчас, и берите один шаг. Ведёте себя сами — ресурсы находите сами.',
    en: 'A synergem growth ladder: the path from gathering to autonomy. Read it together, check where you are now, and take one move. You lead yourselves — you find the resources yourselves.',
  },
  stages: [
    {
      key: 'form',
      name: { ru: 'Собрались', en: 'Gathered' },
      milestone: {
        ru: 'Синергема существует: несколько соучеников открылись вокруг общего усилия.',
        en: 'The synergem exists: a few fellow learners have opened up around a shared effort.',
      },
      readiness: {
        ru: 'Готовы к следующей стадии, когда каждый может назвать, зачем он здесь и вокруг чего вы собрались.',
        en: 'Ready for the next stage when each of you can name why they are here and what you gathered around.',
      },
      move: {
        ru: 'Назовите вслух по кругу общее усилие — одной фразой, с которой согласны все.',
        en: 'Say the shared effort aloud around the circle — in one phrase everyone agrees on.',
      },
    },
    {
      key: 'rhythm',
      name: { ru: 'Ритм', en: 'Rhythm' },
      milestone: {
        ru: 'У группы есть надёжный ритм встреч и ведение, что переходит по кругу.',
        en: 'The group has a dependable meeting cadence and a lead that passes around the circle.',
      },
      readiness: {
        ru: 'Готовы, когда встречи держатся сами — никому не нужно всех догонять.',
        en: 'Ready when the meetings hold themselves — no one has to chase everyone.',
      },
      move: {
        ru: 'Договоритесь об одном повторяющемся времени встречи и о том, кто ведёт следующую.',
        en: 'Agree on one recurring meeting time and on who leads the next one.',
      },
    },
    {
      key: 'output',
      name: { ru: 'Первый результат', en: 'First output' },
      milestone: {
        ru: 'Синергема сделала один общий результат — пусть маленький, — которого никто не сделал бы в одиночку.',
        en: 'The synergem has made one shared result — however small — that none of you would have made alone.',
      },
      readiness: {
        ru: 'Готовы, когда есть конкретная вещь, на которую вы показываете вместе.',
        en: 'Ready when there is a concrete thing you point to together.',
      },
      move: {
        ru: 'Выберите одну маленькую вещь, что вы доведёте до конца вместе к следующей встрече.',
        en: 'Choose one small thing you will finish together by the next meeting.',
      },
    },
    {
      key: 'outward',
      name: { ru: 'Наружу', en: 'Outward' },
      milestone: {
        ru: 'Синергема поворачивается вовне: служит, ведёт клиентов сообща, учит тому, что освоила. Ресурсы группа находит и делит сама.',
        en: 'The synergem turns outward: it serves, finds clients together, teaches what it learned. The group finds and shares resources itself.',
      },
      readiness: {
        ru: 'Готовы, когда ценность течёт из кластера наружу, а не только внутри него.',
        en: 'Ready when value flows out of the cluster, not only within it.',
      },
      move: {
        ru: 'Найдите одного человека вне группы, которому ваш общий результат уже полезен, и предложите его.',
        en: 'Find one person outside the group your shared result already helps, and offer it.',
      },
    },
    {
      key: 'autonomous',
      name: { ru: 'Автономность', en: 'Autonomous' },
      milestone: {
        ru: 'Синергема держит себя сама и больше не нуждается в академии, чтобы существовать.',
        en: 'The synergem sustains itself and no longer needs the academy to exist.',
      },
      readiness: {
        ru: 'Вы на этой стадии, когда кластер продолжил бы жить, исчезни академия завтра.',
        en: 'You are at this stage when the cluster would keep going if the academy vanished tomorrow.',
      },
      move: {
        ru: 'Решите вместе, что делает синергему живой дальше — и запишите это своими словами.',
        en: 'Decide together what keeps the synergem alive from here — and write it in your own words.',
      },
    },
  ],
}

export interface ResolvedAccelStage {
  key: string
  name: string
  milestone: string
  readiness: string
  move: string
}
export interface ResolvedAcceleration {
  intro: string
  stages: ResolvedAccelStage[]
}

export const ACCEL_STAGES = ACCELERATION.stages

export function resolveAcceleration(locale: Locale, source: Acceleration = ACCELERATION): ResolvedAcceleration {
  return {
    intro: source.intro[locale],
    stages: source.stages.map((s) => ({
      key: s.key,
      name: s.name[locale],
      milestone: s.milestone[locale],
      readiness: s.readiness[locale],
      move: s.move[locale],
    })),
  }
}
