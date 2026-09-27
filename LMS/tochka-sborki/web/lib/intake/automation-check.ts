// web/lib/intake/automation-check.ts
//
// «Стоит ли это вообще автоматизировать?» — первый шаг русла задачи в онбординге
// (BACKLOG.md, intake LMS#10, принято владельцем 2026-09-14), сразу после V_OUTCOME.
//
// По мотивам скилла `automation-advisor` из glebis/claude-skills
// (MIT License, © Gleb Kalinin; github.com/glebis/claude-skills/tree/main/automation-advisor):
// там — анкета по четырём измерениям (частота, время на раз, цена ошибки, «долговечность»
// задачи), очковая формула и разбор точки окупаемости. Оригинальный `prompt.md` того скилла
// удалось прочитать лишь через веб-пересказ (не дословно, не построчно), и решение
// (docs/superpowers/research/2026-09-14-lms-prd-intake.md:515-517) — не портировать код:
// «делаем свой — движок детерминированный, ТС на своих данных». Ниже — самостоятельная
// реализация тех же четырёх измерений и идеи окупаемости: свои шкалы, своя формула, простые
// понятные единицы (минуты/часы/месяцы) вместо очков без единиц измерения.
import type { Answers } from './types'

/** 1..5 — тот же likert, что уже рисует <QuestionRenderer> (без правок рендерера). */
export type LikertScore = 1 | 2 | 3 | 4 | 5

/** Грубая прикидка ученика, сколько займёт сама автоматизация. */
export type AutoBuildTime = 'lt1h' | 'h1_4' | 'h4_16' | 'h16plus' | 'dont_know'

export interface AutomationCheckInput {
  /** Как часто нужно делать задачу. 1 — разово, 5 — каждый день. */
  frequency: LikertScore
  /** Сколько времени уходит за один раз. 1 — пара минут, 5 — часы. */
  duration: LikertScore
  /** Цена ошибки. 1 — мелочь, легко исправить, 5 — дорого или опасно. */
  errorCost: LikertScore
  /** Долговечность задачи: сколько ещё она будет актуальна. 1 — скоро не нужна, 5 — годами. */
  longevity: LikertScore
  buildTime: AutoBuildTime
}

export type AutomationVerdict = 'automate' | 'partial' | 'skip'

export interface AutomationCheckResult {
  verdict: AutomationVerdict
  occurrencesPerMonth: number
  minutesPerOccurrence: number
  minutesPerMonth: number
  buildHours: number
  /** true — время на автоматизацию не указано, использована нейтральная прикидка. */
  buildTimeUncertain: boolean
  /** Горизонт расчёта = долговечность задачи (V_AUTO_LONGEVITY), не выдуманная константа. */
  horizonMonths: number
  hoursSavedOverHorizon: number
  /** null — задача разовая (occurrencesPerMonth === 0), окупаемость посчитать нельзя. */
  paybackMonths: number | null
  paysBackWithinHorizon: boolean
}

/** 1 — разово (дальше не повторится), 2 — примерно раз в месяц, 3 — примерно раз в неделю,
 *  4 — несколько раз в неделю, 5 — каждый день (или чаще). */
const FREQUENCY_PER_MONTH: Record<LikertScore, number> = { 1: 0, 2: 1, 3: 4, 4: 12, 5: 30 }

/** 1 — пара минут, 2 — минут десять, 3 — полчаса, 4 — полтора часа, 5 — несколько часов. */
const MINUTES_PER_OCCURRENCE: Record<LikertScore, number> = { 1: 3, 2: 10, 3: 30, 4: 90, 5: 240 }

/** 1 — скоро не нужна (горизонт месяц), 5 — актуальна годами (горизонт два года). */
const HORIZON_MONTHS_BY_LONGEVITY: Record<LikertScore, number> = { 1: 1, 2: 3, 3: 6, 4: 12, 5: 24 }

const BUILD_HOURS: Record<Exclude<AutoBuildTime, 'dont_know'>, number> = {
  lt1h: 0.5,
  h1_4: 2.5,
  h4_16: 10,
  h16plus: 24,
}

/** Нет своей оценки — берём соседнюю по размеру полку (около рабочего дня), не ноль и не крайность. */
const UNKNOWN_BUILD_HOURS = BUILD_HOURS.h4_16

/** С какого значения «цена ошибки» перевешивает хорошую окупаемость → вердикт «частично»
 *  (автоматизировать рутину вокруг, но оставить проверку человеком на ключевых шагах). */
const HIGH_ERROR_COST_THRESHOLD: LikertScore = 4

export function evaluateAutomation(input: AutomationCheckInput): AutomationCheckResult {
  const occurrencesPerMonth = FREQUENCY_PER_MONTH[input.frequency]
  const minutesPerOccurrence = MINUTES_PER_OCCURRENCE[input.duration]
  const minutesPerMonth = occurrencesPerMonth * minutesPerOccurrence
  const horizonMonths = HORIZON_MONTHS_BY_LONGEVITY[input.longevity]

  const buildTimeUncertain = input.buildTime === 'dont_know'
  const buildHours = buildTimeUncertain
    ? UNKNOWN_BUILD_HOURS
    : BUILD_HOURS[input.buildTime as Exclude<AutoBuildTime, 'dont_know'>]
  const buildMinutes = buildHours * 60

  const hoursSavedOverHorizon = (minutesPerMonth * horizonMonths) / 60
  const paybackMonths = minutesPerMonth > 0 ? buildMinutes / minutesPerMonth : null
  const paysBackWithinHorizon = paybackMonths !== null && paybackMonths <= horizonMonths

  const verdict: AutomationVerdict =
    !paysBackWithinHorizon
      ? 'skip'
      : input.errorCost >= HIGH_ERROR_COST_THRESHOLD
        ? 'partial'
        : 'automate'

  return {
    verdict,
    occurrencesPerMonth,
    minutesPerOccurrence,
    minutesPerMonth,
    buildHours,
    buildTimeUncertain,
    horizonMonths,
    hoursSavedOverHorizon,
    paybackMonths,
    paysBackWithinHorizon,
  }
}

const BUILD_TIMES = new Set<string>(['lt1h', 'h1_4', 'h4_16', 'h16plus', 'dont_know'])

function likertOrDefault(v: Answers[string] | undefined, fallback: LikertScore): LikertScore {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5 ? (v as LikertScore) : fallback
}

function likertOrNull(v: Answers[string] | undefined): LikertScore | null {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5 ? (v as LikertScore) : null
}

/**
 * Достаёт вход для evaluateAutomation() из общего словаря ответов анкеты (тот же `answers`,
 * что и у остальных вопросов онбординга — новой таблицы под этот шаг не заводим).
 *
 * null — частота или время на раз ещё не отвечены (шаг необязательный, можно пропустить) —
 * тогда считать нечего. Цена ошибки/долговечность при пропуске — нейтральная середина (3):
 * так шаг не пугает вердиктом «частично» и не льстит вердиктом «автоматизировать» на пустом
 * месте. Время на автоматизацию при пропуске/неизвестном значении — 'dont_know' (см. evaluateAutomation).
 */
export function automationInputFromAnswers(answers: Answers): AutomationCheckInput | null {
  const frequency = likertOrNull(answers['V_AUTO_FREQ'])
  const duration = likertOrNull(answers['V_AUTO_TIME'])
  if (frequency === null || duration === null) return null

  const buildTimeRaw = answers['V_AUTO_BUILD']
  const buildTime: AutoBuildTime =
    typeof buildTimeRaw === 'string' && BUILD_TIMES.has(buildTimeRaw) ? (buildTimeRaw as AutoBuildTime) : 'dont_know'

  return {
    frequency,
    duration,
    errorCost: likertOrDefault(answers['V_AUTO_ERROR'], 3),
    longevity: likertOrDefault(answers['V_AUTO_LONGEVITY'], 3),
    buildTime,
  }
}
