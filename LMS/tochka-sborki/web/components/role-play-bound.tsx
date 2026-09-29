// Серверный модуль (без 'use client'), как interest-example-bound: метка <RolePlay id="…"/> из MDX
// получает сценарий из списка pack'а и рендерит клиентский RolePlay. Неизвестный id — пусто
// (гвард lib/role-play.test.ts не пускает такую метку в контент).
import { ROLE_PLAYS } from '@/lib/course/role-plays'
import { findRolePlay, type RolePlayScenario } from '@/lib/role-play'
import { RolePlay } from '@/components/role-play'

export function bindRolePlay(moduleSlug: string, unitSlug: string, locale: 'ru' | 'en', list: readonly RolePlayScenario[] = ROLE_PLAYS) {
  return function BoundRolePlay({ id }: { id: string }) {
    const scenario = findRolePlay(list, moduleSlug, unitSlug, id)
    return scenario ? <RolePlay scenario={scenario} locale={locale} /> : null
  }
}
