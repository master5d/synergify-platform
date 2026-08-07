import type { Metadata } from 'next'
import { TrainerPage } from '../../../components/speedreading/trainer-page'
import { RsvpReader } from '../../../components/speedreading/rsvp-reader'

export const metadata: Metadata = {
  title: 'RSVP-читалка — Скорочтение',
  description: 'Тренажёр скорочтения: слова вспышками с регулируемой скоростью.',
}

export default function Page() {
  return (
    <TrainerPage
      locale="ru"
      title="RSVP-читалка"
      description="Слова показываются по одному. Поставь удобную скорость и держи взгляд на цветной опорной букве."
    >
      <RsvpReader locale="ru" />
    </TrainerPage>
  )
}
