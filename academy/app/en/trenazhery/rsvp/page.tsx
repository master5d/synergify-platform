import type { Metadata } from 'next'
import { TrainerPage } from '../../../../components/speedreading/trainer-page'
import { RsvpReader } from '../../../../components/speedreading/rsvp-reader'

export const metadata: Metadata = {
  title: 'RSVP Reader — Speed Reading',
  description: 'Speed-reading trainer: words flashed one at a time at an adjustable pace.',
}

export default function Page() {
  return (
    <TrainerPage
      locale="en"
      title="RSVP reader"
      description="Words appear one at a time. Set a comfortable pace and keep your eyes on the coloured pivot letter."
    >
      <RsvpReader locale="en" />
    </TrainerPage>
  )
}
