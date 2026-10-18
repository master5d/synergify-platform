import type { Metadata } from 'next'
import { MenuPage } from '../../../../components/retreat-menu/menu-page'

export const metadata: Metadata = {
  title: 'Retreat menu generator — academy tools',
  description: 'A menu for every day of the retreat: cost per guest and per group, paid add-ons apart, diet and allergen checks, CSV for the chef. Runs in your browser; data goes nowhere.',
}

export default function Page() {
  return <MenuPage locale="en" />
}
