import type { Metadata } from 'next'
import { TrenazheryPage } from '../../components/speedreading/trenazhery-page'

export const metadata: Metadata = {
  title: 'Скорочтение — тренажёры академии',
  description: 'Тренажёры скорочтения: RSVP-ридер, таблицы Шульте, замер скорости с проверкой понимания. Уроки — честный метод без обещаний.',
}

export default function Page() {
  return <TrenazheryPage locale="ru" />
}
