import type { Metadata } from 'next'
import { TrenazheryPage } from '../../../components/speedreading/trenazhery-page'

export const metadata: Metadata = {
  title: 'Speed Reading — academy trainers',
  description: 'Speed-reading trainers: RSVP reader, Schulte tables, a speed test with comprehension check. Lessons teach the honest method, no promises.',
}

export default function Page() {
  return <TrenazheryPage locale="en" />
}
