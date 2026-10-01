import { describe, expect, it } from 'vitest'
import { automationInputFromAnswers, evaluateAutomation, type AutomationCheckInput } from './automation-check'

const base: AutomationCheckInput = {
  frequency: 3, // ~4/month
  duration: 3, // 30 min
  errorCost: 1,
  longevity: 4, // horizon 12mo
  buildTime: 'h1_4', // 2.5h = 150min
}

describe('evaluateAutomation', () => {
  it('одноразовая задача (frequency=1) — не окупается, вердикт skip', () => {
    const r = evaluateAutomation({ ...base, frequency: 1 })
    expect(r.occurrencesPerMonth).toBe(0)
    expect(r.minutesPerMonth).toBe(0)
    expect(r.paybackMonths).toBeNull()
    expect(r.paysBackWithinHorizon).toBe(false)
    expect(r.verdict).toBe('skip')
  })

  it('частая задача, дешёвая ошибка, быстрая сборка — automate', () => {
    const r = evaluateAutomation({ frequency: 5, duration: 3, errorCost: 1, longevity: 5, buildTime: 'lt1h' })
    expect(r.paysBackWithinHorizon).toBe(true)
    expect(r.verdict).toBe('automate')
  })

  it('редкая задача с долгой сборкой — окупаемость дольше горизонта, skip', () => {
    const r = evaluateAutomation({ frequency: 2, duration: 1, errorCost: 1, longevity: 1, buildTime: 'h16plus' })
    // 1 occurrence/month * 3 min = 3 min/month; build 24h = 1440 min → payback 480mo, horizon 1mo
    expect(r.paybackMonths).toBeGreaterThan(r.horizonMonths)
    expect(r.paysBackWithinHorizon).toBe(false)
    expect(r.verdict).toBe('skip')
  })

  it('высокая цена ошибки понижает automate до partial, даже при хорошей окупаемости', () => {
    const good = evaluateAutomation({ ...base, errorCost: 1 })
    const risky = evaluateAutomation({ ...base, errorCost: 4 })
    expect(good.verdict).toBe('automate')
    expect(good.paysBackWithinHorizon).toBe(true)
    expect(risky.verdict).toBe('partial')
    expect(risky.paysBackWithinHorizon).toBe(true) // тот же расчёт — меняется только вердикт
  })

  it('errorCost=5 (максимум) тоже даёт partial, а не отдельный четвёртый вердикт', () => {
    const r = evaluateAutomation({ ...base, errorCost: 5 })
    expect(r.verdict).toBe('partial')
  })

  it('errorCost=3 (середина, дефолт при пропуске) — ниже порога, не понижает вердикт', () => {
    const r = evaluateAutomation({ ...base, errorCost: 3 })
    expect(r.verdict).toBe('automate')
  })

  it('граница горизонта включительно: paybackMonths === horizonMonths → окупается (<=)', () => {
    // frequency=3 → 4/mo, duration=3 → 30min → minutesPerMonth=120 → 2h/mo.
    // longevity=1 → horizon 1mo. Нужен buildHours=2h ровно — нет такой полки, берём
    // frequency=2 (1/mo) * duration=3 (30min) = 30 min/mo = 0.5h/mo, horizon(longevity=1)=1mo.
    // buildTime='lt1h'=0.5h → payback = 0.5h / 0.5h(мес) = 1mo === horizon(1mo).
    const r = evaluateAutomation({ frequency: 2, duration: 3, errorCost: 1, longevity: 1, buildTime: 'lt1h' })
    expect(r.paybackMonths).toBe(1)
    expect(r.horizonMonths).toBe(1)
    expect(r.paysBackWithinHorizon).toBe(true)
    expect(r.verdict).toBe('automate')
  })

  it('чуть за горизонтом — уже не окупается', () => {
    // Тот же расчёт, но горизонт короче (longevity ниже некуда быть не может — 1 уже минимум),
    // поэтому берём чуть более дорогую сборку: h1_4=2.5h вместо lt1h=0.5h → payback 5mo > 1mo.
    const r = evaluateAutomation({ frequency: 2, duration: 3, errorCost: 1, longevity: 1, buildTime: 'h1_4' })
    expect(r.paybackMonths).toBeGreaterThan(r.horizonMonths)
    expect(r.paysBackWithinHorizon).toBe(false)
    expect(r.verdict).toBe('skip')
  })

  it("buildTime='dont_know' — считает по нейтральной прикидке (h4_16) и помечает buildTimeUncertain", () => {
    const known = evaluateAutomation({ ...base, buildTime: 'h4_16' })
    const unknown = evaluateAutomation({ ...base, buildTime: 'dont_know' })
    expect(unknown.buildTimeUncertain).toBe(true)
    expect(known.buildTimeUncertain).toBe(false)
    expect(unknown.buildHours).toBe(known.buildHours)
    expect(unknown.verdict).toBe(known.verdict)
  })

  it('долговечность (longevity) определяет горизонт расчёта, а не константа', () => {
    const short = evaluateAutomation({ ...base, longevity: 1 })
    const long = evaluateAutomation({ ...base, longevity: 5 })
    expect(short.horizonMonths).toBe(1)
    expect(long.horizonMonths).toBe(24)
    expect(long.hoursSavedOverHorizon).toBeGreaterThan(short.hoursSavedOverHorizon)
  })
})

describe('automationInputFromAnswers', () => {
  it('нет частоты — null (считать нечего, шаг можно пропустить)', () => {
    expect(automationInputFromAnswers({ V_AUTO_TIME: 3 })).toBeNull()
  })

  it('нет времени на раз — null', () => {
    expect(automationInputFromAnswers({ V_AUTO_FREQ: 3 })).toBeNull()
  })

  it('мусорное значение вместо likert (строка, вне диапазона, дробное) — null', () => {
    expect(automationInputFromAnswers({ V_AUTO_FREQ: 'often' as any, V_AUTO_TIME: 3 })).toBeNull()
    expect(automationInputFromAnswers({ V_AUTO_FREQ: 9, V_AUTO_TIME: 3 })).toBeNull()
    expect(automationInputFromAnswers({ V_AUTO_FREQ: 2.5, V_AUTO_TIME: 3 })).toBeNull()
  })

  it('цена ошибки/долговечность пропущены — дефолт 3 (нейтральная середина)', () => {
    const input = automationInputFromAnswers({ V_AUTO_FREQ: 3, V_AUTO_TIME: 3 })
    expect(input).toEqual({ frequency: 3, duration: 3, errorCost: 3, longevity: 3, buildTime: 'dont_know' })
  })

  it('время на автоматизацию — мусорное значение тоже падает на dont_know', () => {
    const input = automationInputFromAnswers({ V_AUTO_FREQ: 3, V_AUTO_TIME: 3, V_AUTO_BUILD: 'forever' })
    expect(input?.buildTime).toBe('dont_know')
  })

  it('все поля даны — проходят как есть', () => {
    const input = automationInputFromAnswers({
      V_AUTO_FREQ: 4, V_AUTO_TIME: 2, V_AUTO_ERROR: 5, V_AUTO_LONGEVITY: 1, V_AUTO_BUILD: 'h16plus',
    })
    expect(input).toEqual({ frequency: 4, duration: 2, errorCost: 5, longevity: 1, buildTime: 'h16plus' })
  })
})
