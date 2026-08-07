import type { Metadata } from 'next'
import { TrainerPage } from '../../../../components/speedreading/trainer-page'
import { WpmTest } from '../../../../components/speedreading/wpm-test'

export const metadata: Metadata = {
  title: 'Reading-Speed Test — Speed Reading',
  description: 'Measure your reading speed adjusted for comprehension.',
}

export default function Page() {
  return (
    <TrainerPage
      locale="en"
      title="Reading-speed test"
      description="Read a short passage, answer the questions, and see your speed adjusted for comprehension. Repeat later to compare."
    >
      <WpmTest locale="en" />
    </TrainerPage>
  )
}
