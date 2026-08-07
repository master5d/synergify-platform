import type { Metadata } from 'next'
import { TrainerPage } from '../../../components/speedreading/trainer-page'
import { WpmTest } from '../../../components/speedreading/wpm-test'

export const metadata: Metadata = {
  title: 'Тест скорости — Скорочтение',
  description: 'Замерь скорость чтения с поправкой на понимание.',
}

export default function Page() {
  return (
    <TrainerPage
      locale="ru"
      title="Тест скорости чтения"
      description="Прочитай короткий текст, ответь на вопросы и увидь свою скорость с поправкой на понимание. Повтори позже, чтобы сравнить."
    >
      <WpmTest locale="ru" />
    </TrainerPage>
  )
}
