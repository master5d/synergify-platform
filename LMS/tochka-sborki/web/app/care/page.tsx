import type { Metadata } from 'next'
import { CarePage } from '@/components/pages/care-page'
import { careCopy } from '@/lib/care'
import { pageTitle } from '@/lib/page-title'

const t = careCopy('ru')

// Служба заботы — помощь по курсу. Не /support/: там «Поддержать» (донат).
export const metadata: Metadata = { title: pageTitle(t.title), description: t.lead }

export default function Page() {
  return <CarePage locale="ru" />
}
