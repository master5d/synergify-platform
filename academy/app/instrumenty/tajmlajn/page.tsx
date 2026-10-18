import type { Metadata } from 'next'
import { TimelinePage } from '../../../components/retreat-timeline/timeline-page'

export const metadata: Metadata = {
  title: 'Таймлайн ретрита — инструменты академии',
  description: 'Все сроки ретрита по датам: платежи площадке, точка невозврата, отмены гостей, анкета, меню и лист прибытия. Считается в браузере, данные никуда не уходят.',
}

export default function Page() {
  return <TimelinePage locale="ru" />
}
