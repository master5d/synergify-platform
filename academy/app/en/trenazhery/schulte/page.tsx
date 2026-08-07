import type { Metadata } from 'next'
import { TrainerPage } from '../../../../components/speedreading/trainer-page'
import { SchulteTable } from '../../../../components/speedreading/schulte-table'

export const metadata: Metadata = {
  title: 'Schulte Tables — Speed Reading',
  description: 'Peripheral-vision trainer: find the numbers in order while holding your gaze at the centre.',
}

export default function Page() {
  return (
    <TrainerPage
      locale="en"
      title="Schulte tables"
      description="Hold your gaze on the centre dot and find the numbers in order, catching them with your side vision."
    >
      <SchulteTable locale="en" />
    </TrainerPage>
  )
}
