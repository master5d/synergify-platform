import type { Metadata } from 'next'
import { LadderPage } from '../../../components/format-ladder/ladder-page'

export const metadata: Metadata = {
  title: 'Лесенка форматов — инструменты академии',
  description: 'Форматы от встречи один на один до онлайн-клуба: ступени, каналы, классы событий и твой следующий шаг.',
}

export default function Page() { return <LadderPage locale="ru" /> }
