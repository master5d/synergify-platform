// web/lib/cs/modes.ts
import type { Mode, ModeConfig } from './types'

export const MODE: Record<Mode, ModeConfig> = {
  commander: {
    multiplier: 1.0,
    hintVisible: true,
    challengeTier: 'task',
    label: { ru: 'Командир', en: 'Commander' },
    desc: {
      ru: 'Чёткие шаги и подсказка наставника. Базовый темп.',
      en: 'Clear steps with the mentor hint. Baseline pace.',
    },
  },
  copilot: {
    multiplier: 1.5,
    hintVisible: true,
    challengeTier: 'process',
    label: { ru: 'Со-пилот', en: 'Co-Pilot' },
    desc: {
      ru: 'Подсказка остаётся, но задачу ведёшь ты. ×1.5 шардов.',
      en: 'Hint stays, but you drive the process. ×1.5 shards.',
    },
  },
  archmage: {
    multiplier: 2.5,
    hintVisible: false,
    challengeTier: 'outcome',
    label: { ru: 'Архимаг', en: 'Silent Archmage' },
    desc: {
      ru: 'Без подсказки — только цель. ×2.5 шардов.',
      en: 'No hint — only the outcome. ×2.5 shards.',
    },
  },
}
