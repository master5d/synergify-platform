import type { AttributeCode } from './types'

export interface AttributeMeta {
  code: AttributeCode
  emoji: string
  name: { ru: string; en: string }
  meaning: { ru: string; en: string }
  max: number
}

export const ATTRIBUTES: AttributeMeta[] = [
  { code: 'INT', emoji: '🧠', max: 30,
    name: { ru: 'Тех-разум', en: 'Tech-Mind' },
    meaning: { ru: 'глубина в технике и абстракциях', en: 'depth in tech & abstraction' } },
  { code: 'WIS', emoji: '📚', max: 25,
    name: { ru: 'Самообучение', en: 'Self-Learning' },
    meaning: { ru: 'учиться самому, без подсказок', en: 'learning on your own' } },
  { code: 'CON', emoji: '🛡', max: 25,
    name: { ru: 'Стойкость', en: 'Stamina' },
    meaning: { ru: 'не бросаешь, анти-выгорание', en: 'persistence, anti-burnout' } },
  { code: 'DEX', emoji: '⚡', max: 20,
    name: { ru: 'Темп', en: 'Tempo' },
    meaning: { ru: 'как быстро хочешь результат', en: 'how fast you want results' } },
  { code: 'CHA', emoji: '🌟', max: 20,
    name: { ru: 'Харизма', en: 'Charisma' },
    meaning: { ru: 'клиенты и сообщество', en: 'client & community orientation' } },
  { code: 'STR', emoji: '🔨', max: 20,
    name: { ru: 'Размах', en: 'Ambition' },
    meaning: { ru: 'масштаб того, что строишь', en: 'scope of what you build' } },
]
