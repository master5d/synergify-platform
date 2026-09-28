import type { Metadata } from 'next'
import { EideticsTrainerPage } from '../../../../components/eidetics/eidetics-page'
import { MemoryPalace } from '../../../../components/eidetics/memory-palace'
import { eideticsRobots } from '../../../../lib/eidetics/course'
import { DVOREC_UI } from '../../../../lib/eidetics/ui'

const t = DVOREC_UI.ru

export const metadata: Metadata = {
  title: `${t.title} — Эйдетика`,
  description: t.description,
  robots: eideticsRobots(),
}

export default function Page() {
  return (
    <EideticsTrainerPage locale="ru" title={t.title} description={t.description}>
      <MemoryPalace locale="ru" />
    </EideticsTrainerPage>
  )
}
