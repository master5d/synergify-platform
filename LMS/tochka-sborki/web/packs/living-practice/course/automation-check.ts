// packs/living-practice/course/automation-check.ts
// Форма эталона. Фича у этого курса не подключена — в intake-questions.ts этого пака нет
// вопросов V_AUTO_*, шаг никогда не показывается и этот текст никто не видит. Файл существует
// только для того, чтобы @pack-alias резолвился на обе сборки (lib/boundary.test.ts: stubs are
// thin @pack re-exports). Содержимое — дословная копия packs/tochka-sborki (тот же контракт),
// не переписывалось под голос этого курса ровно потому, что оно нигде не рендерится.
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
