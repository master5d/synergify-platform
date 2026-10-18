import type { Metadata } from 'next'
import { ProgramPage } from '../../../components/retreat-program/program-page'
export const metadata: Metadata = { title: 'Конструктор программы ретрита — инструменты академии', description: 'Сетка дней ретрита по 30 минут из практик вашего реестра: нагрузка, свободное время, касание и обещания под проверкой, CSV и печать. Считается в браузере, данные никуда не уходят.' }
export default function Page() { return <ProgramPage locale="ru" /> }
