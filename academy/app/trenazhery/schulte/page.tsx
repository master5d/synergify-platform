import type { Metadata } from 'next'
import { TrainerPage } from '../../../components/speedreading/trainer-page'
import { SchulteTable } from '../../../components/speedreading/schulte-table'

export const metadata: Metadata = {
  title: 'Таблицы Шульте — Скорочтение',
  description: 'Тренажёр периферийного зрения: находи числа по порядку, удерживая взгляд в центре.',
}

export default function Page() {
  return (
    <TrainerPage
      locale="ru"
      title="Таблицы Шульте"
      description="Держи взгляд на точке в центре и находи числа по порядку, замечая их боковым зрением."
    >
      <SchulteTable locale="ru" />
    </TrainerPage>
  )
}
