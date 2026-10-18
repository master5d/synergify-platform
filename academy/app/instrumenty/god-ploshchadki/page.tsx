import type { Metadata } from 'next'
import { VenuePage } from '../../../components/retreat-venue/venue-page'
export const metadata: Metadata = { title: 'Год площадки ретритов — инструменты академии', description: 'Год площадки по месяцам: ретритные недели против посуточной сдачи, загрузка, итог месяца и года, окупаемость проекта и своих денег. Для всесезонной площадки и сезонного глэмпинга. Считается в браузере.' }
export default function Page() { return <VenuePage locale="ru" /> }
