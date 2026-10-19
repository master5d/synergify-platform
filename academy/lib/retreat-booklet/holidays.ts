import { addDays, type IsoDate } from '../retreat-core/dates'
import type { Lang } from '../retreat-calc/engine'
export function holidaysOverlapping(start: IsoDate, nights: number, lang: Lang): { id: string; name: string }[] {
  const from = new Date(`${start}T00:00:00Z`).getTime(); const to = new Date(`${addDays(start, nights)}T00:00:00Z`).getTime(); const out: { id: string; name: string }[] = []
  const add = (id: string, name: string, a: string, b: string) => { const x = new Date(`${a}T00:00:00Z`).getTime(); const y = new Date(`${b}T00:00:00Z`).getTime();
  if (x <= to && y >= from) out.push({ id, name }) }
  const years = [new Date(from).getUTCFullYear() - 1, new Date(from).getUTCFullYear(), new Date(to).getUTCFullYear()]
  for (const y of years) { add('new-year', lang === 'ru' ? 'Новый год и каникулы' : 'New Year holidays', `${y}-12-31`, `${y + 1}-01-08`);
  add('may-holidays', lang === 'ru' ? 'Майские праздники' : 'May holidays', `${y}-05-01`, `${y}-05-10`);
  add('christmas', lang === 'ru' ? 'Рождество' : 'Christmas', `${y}-12-24`, `${y}-12-26`)
    const nov = new Date(Date.UTC(y, 10, 1)); const first = (4 - nov.getUTCDay() + 7) % 7 + 1; const day = first + 21;
  const thanksgiving = `${y}-11-${String(day).padStart(2, '0')}`;
  add('thanksgiving', lang === 'ru' ? 'День благодарения США' : 'US Thanksgiving', thanksgiving, addDays(thanksgiving, 1)) }
  return [...new Map(out.map((x) => [x.id, x])).values()]
}
