import { COURSE } from '@/lib/course'
import { AuthGuard } from '@/components/auth-guard'
import { IntakeGuard } from '@/components/intake-guard'
import { AdmissionGuard } from '@/components/admission-guard'
import type { Locale } from '@/lib/dictionaries'

/**
 * Двери урока по объявлению курса (Ф4 S4).
 *
 * Раньше набор гвардов был вшит в страницу: любой новый курс автоматически
 * получал опросник профиля «Точки Сборки» и не получал допуска академии.
 * Теперь состав дверей приходит из pack'а — и переезд курсов школы под движок
 * не открывает их уроки всем подряд.
 */
export function UnitGates({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const { auth, intake, admission } = COURSE.gates
  let node = <>{children}</>
  if (admission) node = <AdmissionGuard locale={locale}>{node}</AdmissionGuard>
  if (intake) node = <IntakeGuard locale={locale}>{node}</IntakeGuard>
  if (auth) node = <AuthGuard locale={locale}>{node}</AuthGuard>
  return node
}
