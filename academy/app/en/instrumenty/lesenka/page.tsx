import type { Metadata } from 'next'
import { LadderPage } from '../../../../components/format-ladder/ladder-page'

export const metadata: Metadata = {
  title: 'Format ladder — academy tools',
  description: 'Formats from a one-to-one meeting to an online club: steps, channels, event classes and your next step.',
}

export default function Page() { return <LadderPage locale="en" /> }
