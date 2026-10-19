// Для кнопки «Собрать буклет» в калькуляторе: ссылка калькулятора с его цифрами (цена, депозит, срок доплаты, опции
// проживания) и паспорт ретрита. Старт — через «месяцев до старта» от сегодня, как у кнопки в таймлайн.
import { num, toInputs, type Form } from '../../lib/retreat-calc/form'
import { encodeLink, type LinkData } from '../../lib/retreat-calc/link'
import { addDays, addMonths, type IsoDate } from '../../lib/retreat-core/dates'
import { pickPassport, type RetreatPassport } from '../../lib/retreat-core/passport'

const startOf = (f: Form, today: IsoDate): IsoDate => {
  if (f.daysToStart !== undefined) return addDays(today, f.daysToStart)
  const months = num(f.monthsToStart)
  return addMonths(today, Number.isInteger(months) && months >= 1 ? months : 6)
}

export function calcHash(f: Form, today: IsoDate): string {
  const i = toInputs(f)
  const units = (c: number) => c / 100
  const data: LinkData = {
    v: 1, title: f.title || undefined, currency: i.currency, price: units(i.pricePerGuest), guests: i.guests, nights: i.nights,
    daysToStart: Math.round((Date.parse(`${startOf(f, today)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000),
    guestBalanceDueDays: i.guestBalanceDueDays,
    ...(i.guestDeposit.kind === 'pct' ? { guestDepositPct: i.guestDeposit.value } : { guestDeposit: units(i.guestDeposit.value) }),
    ...(i.accommodation?.length
      ? { accommodation: i.accommodation.map((a) => ({ name: a.name, guests: a.guests, surcharge: units(a.surcharge), cost: units(a.cost) })) }
      : {}),
  }
  return encodeLink(data)
}

export function calcPassport(f: Form, today: IsoDate): RetreatPassport {
  const i = toInputs(f)
  return pickPassport({ title: f.title || undefined, currency: i.currency, guests: i.guests, nights: i.nights, start: startOf(f, today) })
}
