import type { Metadata } from 'next'
import { EideticsTrainerPage } from '../../../../../components/eidetics/eidetics-page'
import { SeriesRecall } from '../../../../../components/eidetics/series-recall'
import { eideticsRobots } from '../../../../../lib/eidetics/course'
import { RYAD_UI } from '../../../../../lib/eidetics/ui'

const t = RYAD_UI.en

export const metadata: Metadata = {
  title: `${t.title} — Eidetics`,
  description: t.description,
  robots: eideticsRobots(),
}

export default function Page() {
  return (
    <EideticsTrainerPage locale="en" title={t.title} description={t.description}>
      <SeriesRecall locale="en" />
    </EideticsTrainerPage>
  )
}
