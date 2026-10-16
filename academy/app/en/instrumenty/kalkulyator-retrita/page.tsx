import type { Metadata } from 'next'
import { CalculatorPage } from '../../../../components/retreat-calc/calculator-page'

export const metadata: Metadata = {
  title: 'Retreat calculator — academy tools',
  description: 'Honest retreat economics: the venue contract, your own costs, break-even and a month-by-month cash plan. Runs in your browser; data goes nowhere.',
}

export default function Page() {
  return <CalculatorPage locale="en" />
}
