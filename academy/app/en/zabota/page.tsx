import { CarePage } from '../../../components/care-page'
import { getCare } from '../../../lib/care'

const t = getCare('en')

export const metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
}

export default function Page() {
  return <CarePage locale="en" />
}
