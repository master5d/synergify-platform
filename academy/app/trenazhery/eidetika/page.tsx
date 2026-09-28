import type { Metadata } from 'next'
import { EideticsPage } from '../../../components/eidetics/eidetics-page'
import { eideticsRobots } from '../../../lib/eidetics/course'

export const metadata: Metadata = {
  title: 'Эйдетика — тренажёры памяти',
  description: 'Приёмы запоминания через образы, сюжет и метод локусов — с честной проверкой, держится ли. Без обещаний «фотографической памяти».',
  robots: eideticsRobots(),
}

export default function Page() {
  return <EideticsPage locale="ru" />
}
