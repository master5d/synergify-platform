import type { Metadata } from 'next'
import { TimelinePage } from '../../../../components/retreat-timeline/timeline-page'

export const metadata: Metadata = {
  title: 'Retreat timeline — academy tools',
  description: 'Every retreat deadline by date: venue payments, the point of no return, guest cancellations, the guest form, the menu and the arrival list. Runs in your browser; data goes nowhere.',
}

export default function Page() {
  return <TimelinePage locale="en" />
}
