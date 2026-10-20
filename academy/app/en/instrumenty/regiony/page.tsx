import type { Metadata } from 'next'
import { RegionsPage } from '../../../../components/retreat-regions/regions-page'

export const metadata: Metadata = {
  title: 'Retreat regions — academy tools',
  description: 'Does a region fit your retreat: theme, audience, the character of the place.',
}

export default function Page() { return <RegionsPage locale="en" /> }
