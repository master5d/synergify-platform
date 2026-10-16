import type { Metadata } from 'next'
import { CalculatorPage } from '../../../components/retreat-calc/calculator-page'

export const metadata: Metadata = {
  title: 'Калькулятор ретрита — инструменты академии',
  description: 'Честная экономика ретрита: контракт с площадкой, ваши расходы, безубыточность и кассовый план по месяцам. Считается в браузере, данные никуда не уходят.',
}

export default function Page() {
  return <CalculatorPage locale="ru" />
}
