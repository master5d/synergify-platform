import type { Form } from '../../lib/retreat-calc/form'
import { encodeLink } from '../../lib/retreat-calc/link'
import { addDays, type IsoDate } from '../../lib/retreat-core/dates'
import type { RetreatPassport } from '../../lib/retreat-core/passport'

export function calcHash(form: Form): string {
  return encodeLink({ v: 1, title: form.title, currency: form.currency, price: Number(form.price), guests: Number(form.guests), nights: Number(form.nights), daysToStart: form.daysToStart, guestDepositPct: form.depositMode === 'pct' ? Number(form.deposit) : undefined, guestDeposit: form.depositMode === 'amount' ? Number(form.deposit) : undefined, guestBalanceDueDays: Number(form.balanceDueDays) })
}
export function calcPassport(form: Form, today: IsoDate): RetreatPassport {
  return { title: form.title, currency: form.currency, guests: Number(form.guests), nights: Number(form.nights), start: form.daysToStart === undefined ? undefined : addDays(today, form.daysToStart) }
}
