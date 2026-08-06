import { AcademyPage } from '../../components/academy-page'
import { getDictionary } from '../../lib/dictionaries'

const t = getDictionary('en').academy

export const metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
}

export default function Page() {
  return <AcademyPage locale="en" />
}
