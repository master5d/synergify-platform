// packs/tochka-sborki/course/automation-check.ts
//
// Тексты шага «Стоит ли это вообще автоматизировать?» (module V, после V_OUTCOME) —
// BACKLOG.md, intake LMS#10, принято владельцем 2026-09-14. По мотивам скилла
// `automation-advisor` из glebis/claude-skills (MIT, © Gleb Kalinin;
// github.com/glebis/claude-skills/tree/main/automation-advisor) — происхождение и решение
// не портировать код, а сделать свою реализацию, разобраны в lib/intake/automation-check.ts
// (там же — формула и лицензия). Здесь — только копия вердиктов и подписей, RU/EN.
// Черновик: формулировки на вычитку владельцем.
import type { Locale } from '@/lib/intake/types'
import type { AutomationVerdict } from '@/lib/intake/automation-check'

type L = Record<Locale, string>

export interface AutomationCheckVerdictCopy {
  badge: L
  headline: L
  body: L
}

export interface AutomationCheckData {
  eyebrow: L
  heading: L
  lead: L
  incomplete: L
  uncertainBuild: L
  monthUnit: L
  hourUnit: L
  verdicts: Record<AutomationVerdict, AutomationCheckVerdictCopy>
}

export const AUTOMATION_CHECK: AutomationCheckData = {
  eyebrow: { ru: 'Прежде чем выбирать инструмент', en: 'Before picking a tool' },
  heading: { ru: 'Стоит ли это вообще автоматизировать?', en: 'Is this even worth automating?' },
  lead: {
    ru: 'Четыре вопроса выше — не экзамен, а быстрая прикидка. Дальше — расчёт: сколько времени экономит автоматизация и когда она окупится.',
    en: 'The four questions above are a quick gut-check, not an exam. Below is the math: how much time automation saves, and when it pays for itself.',
  },
  incomplete: {
    ru: 'Не хватает пары ответов выше, чтобы посчитать, — это нормально, шаг необязательный. Вернись назад, если хочешь увидеть цифры, или иди дальше.',
    en: "A couple of answers above are still missing, so there's nothing to calculate yet — that's fine, this step is optional. Go back if you want the numbers, or move on.",
  },
  uncertainBuild: {
    ru: 'Оценка времени на автоматизацию не указана — расчёт ниже на грубой средней прикидке (около рабочего дня).',
    en: 'No estimate for the build time — the numbers below use a rough middle guess (about a workday).',
  },
  monthUnit: { ru: 'мес.', en: 'mo' },
  hourUnit: { ru: 'ч', en: 'h' },
  verdicts: {
    automate: {
      badge: { ru: 'Автоматизировать', en: 'Automate' },
      headline: { ru: 'Похоже, стоит', en: 'Looks worth it' },
      body: {
        ru: 'Часто повторяется, шаги предсказуемы, ошибка не страшна — время на автоматизацию отбивается с запасом.',
        en: 'It repeats often, the steps are predictable, a mistake is not scary — the build time pays for itself with room to spare.',
      },
    },
    partial: {
      badge: { ru: 'Частично', en: 'Partially' },
      headline: { ru: 'Автоматизировать с оглядкой', en: 'Automate, but keep a human in the loop' },
      body: {
        ru: 'Цена ошибки высокая — лучше оставить проверку человеком на ключевых шагах, а рутину вокруг неё автоматизировать.',
        en: 'The cost of a mistake is high — keep a human check on the key steps and automate the routine around it.',
      },
    },
    skip: {
      badge: { ru: 'Не стоит', en: 'Not worth it' },
      headline: { ru: 'Пока не стоит', en: 'Not yet' },
      body: {
        ru: 'Разово, или окупится дольше, чем задача вообще будет актуальна, — быстрее сделать руками.',
        en: "It's a one-off, or the payback outlasts how long the task will even matter — faster to just do it by hand.",
      },
    },
  },
}
