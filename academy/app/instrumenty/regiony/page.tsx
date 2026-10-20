import type { Metadata } from 'next'
import { RegionsPage } from '../../../components/retreat-regions/regions-page'

export const metadata: Metadata = {
  title: 'Регионы ретритов — инструменты академии',
  description: 'Подходит ли регион вашему ретриту: тема, аудитория, характер места.',
}

export default function Page() { return <RegionsPage locale="ru" /> }
