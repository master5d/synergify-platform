import type { Metadata } from 'next'
import { BookletPage } from '../../../components/retreat-booklet/booklet-page'
export const metadata: Metadata = { title: 'Буклет ретрита — инструменты академии', description: 'Соберите честный буклет ретрита в браузере.' }
export default function Page() { return <BookletPage locale="ru" /> }
