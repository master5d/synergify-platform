import type { Metadata } from 'next'
import { EideticsTrainerPage } from '../../../../components/eidetics/eidetics-page'
import { SeriesRecall } from '../../../../components/eidetics/series-recall'
import { eideticsRobots } from '../../../../lib/eidetics/course'
import { RYAD_UI } from '../../../../lib/eidetics/ui'

const t = RYAD_UI.ru

export const metadata: Metadata = {
  title: `${t.title} — Эйдетика`,
  description: t.description,
  robots: eideticsRobots(),
}

export default function Page() {
  return (
    <EideticsTrainerPage locale="ru" title={t.title} description={t.description}>
      <SeriesRecall locale="ru" />
    </EideticsTrainerPage>
  )
}
