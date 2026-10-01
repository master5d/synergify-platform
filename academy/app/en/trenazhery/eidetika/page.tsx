import type { Metadata } from 'next'
import { EideticsPage } from '../../../../components/eidetics/eidetics-page'
import { eideticsRobots } from '../../../../lib/eidetics/course'

export const metadata: Metadata = {
  title: 'Eidetics — memory trainers',
  description: 'Memory techniques through images, stories and the method of loci — with an honest check of whether it holds. No "photographic memory" promises.',
  robots: eideticsRobots(),
}

export default function Page() {
  return <EideticsPage locale="en" />
}
