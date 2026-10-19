import type { Metadata } from 'next'
import { LandingPage } from '../../../components/retreat-landing/landing-page'
export const metadata: Metadata = { title: 'Лендинг ретрита — инструменты академии', description: 'Соберите страницу записи на ретрит из своего буклета.' }
export default function Page() { return <LandingPage locale="ru" /> }
