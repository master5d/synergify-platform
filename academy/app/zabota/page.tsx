import { CarePage } from '../../components/care-page'
import { getCare } from '../../lib/care'

const t = getCare('ru')

export const metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
}

export default function Page() {
  return <CarePage locale="ru" />
}
