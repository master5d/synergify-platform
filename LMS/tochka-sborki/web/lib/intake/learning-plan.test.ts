import { describe, it, expect } from 'vitest'
import { buildLearningPlan, profileToLearningPlan, type LearningPlanInput } from './learning-plan'
import type { ZoneVM } from '@/lib/rpg/types'

const base: LearningPlanInput = {
  locale: 'ru', outcome: 'запустить свой продукт', niche: 'коуч', level: 3,
  completedCount: 2, total: 9,
  steps: [{ name: 'Промпт-инжиниринг', transform: { from: 'прошу не то', to: 'формулирую точно' } }],
  experiential: ['Упражнения 1–8 — закрепи навыки (/exercises)'],
  accountability: ['напарник — ИИ для со-мышления'],
}

describe('buildLearningPlan', () => {
  it('renders the title, all 6 sections, and the variable content (ru)', () => {
    const md = buildLearningPlan(base)
    expect(md).toContain('# Личный план обучения')
    expect(md).toContain('## 🎯 Цель')
    expect(md).toContain('запустить свой продукт')
    expect(md).toContain('Дедлайн: ___ (поставь свой)')
    expect(md).toContain('## 📍 Где я сейчас')
    expect(md).toContain('пройдено 2 из 9 модулей')
    expect(md).toContain('## 📚 Шаги обучения (следующие)')
    expect(md).toContain('- Промпт-инжиниринг: из прошу не то → в формулирую точно')
    expect(md).toContain('## 🛠 Шаги через опыт')
    expect(md).toContain('- Упражнения 1–8 — закрепи навыки (/exercises)')
    expect(md).toContain('## 🤝 Кто может помочь')
    expect(md).toContain('- напарник — ИИ для со-мышления')
    expect(md).toContain('## 🔁 Ревью')
    expect(md).toContain('> Этот план — твой.')
  })

  it('uses the goal fallback when outcome is null and the all-done line when steps is empty', () => {
    const md = buildLearningPlan({ ...base, outcome: null, steps: [] })
    expect(md).toContain('— (впиши свой результат)')
    expect(md).toContain('Все модули пройдены — выбери, что углубить.')
  })

  it('renders English headers and connectives', () => {
    const md = buildLearningPlan({ ...base, locale: 'en' })
    expect(md).toContain('# Personal Learning Plan')
    expect(md).toContain('## 🎯 Goal')
    expect(md).toContain('## 🔁 Review')
    expect(md).toContain('from прошу не то → to формулирую точно')
  })
})

describe('profileToLearningPlan', () => {
  const zones: ZoneVM[] = [
    { slug: '00', order: 0, zoneName: 'Старт', questTitle: '', moduleTitle: '', durationLabel: '', status: 'completed', isNiche: false, href: '#' },
    { slug: '01', order: 1, zoneName: 'Знакомство', questTitle: '', moduleTitle: '', durationLabel: '', status: 'current', isNiche: false, href: '#', transform: { from: 'ИИ это код', to: 'четыре сдвига' } },
    { slug: '02', order: 2, zoneName: 'Сетап', questTitle: '', moduleTitle: '', durationLabel: '', status: 'todo', isNiche: false, href: '#' },
  ]
  const profile = { answers: JSON.stringify({ F3: 'стать AI-generalist' }), char_level: 4, niche: 'предприниматель', world_skin: 'wanderer' }

  it('composes outcome, status, and the current step from the profile + zones', () => {
    const md = profileToLearningPlan(profile, zones, 'ru')
    expect(md).toContain('стать AI-generalist')         // outcome from F3
    expect(md).toContain('предприниматель')              // niche
    expect(md).toContain('пройдено 1 из 3 модулей')      // 1 completed of 3 zones
    expect(md).toContain('- Знакомство: из ИИ это код → в четыре сдвига') // current zone + transform
    expect(md).toContain('/exercises')                   // course experiential default
    expect(md).toContain('/ask')                         // accountability default
  })
})
