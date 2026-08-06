import { CharterPage } from '../../components/charter-page'
import { getCharter } from '../../lib/charter'

const t = getCharter('ru')

export const metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
}

export default function Page() {
  return <CharterPage locale="ru" />
}
