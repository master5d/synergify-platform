// Серверные привязки pretest (LMS#20, Педагогика 2): вставка — через компоненты MDX, а не правкой уроков.
// <Phase type="activation"> получает в конце блок «Угадай до объяснения»; метка <SelfCheck id/> вопроса
// из pretest — напоминание о догадке над собой. Прочие фазы и метки — как были.
import type { ComponentType, ReactNode } from 'react'
import { Phase } from '@/components/phase'
import { Pretest, PretestEcho } from '@/components/pretest'
import type { PhaseType } from '@/components/phase-chrome'

export function bindPretestPhase(enabled: boolean, locale: 'ru' | 'en') {
  return function BoundPhase({ type, children }: { type: PhaseType; children: ReactNode }) {
    return (
      <Phase type={type}>
        {children}
        {enabled && type === 'activation' && <Pretest locale={locale} />}
      </Phase>
    )
  }
}

export function bindPretestEcho(SelfCheck: ComponentType<{ id: string }>, ids: string[], locale: 'ru' | 'en') {
  return function EchoedSelfCheck({ id }: { id: string }) {
    return (
      <>
        {ids.includes(id) && <PretestEcho id={id} locale={locale} />}
        <SelfCheck id={id} />
      </>
    )
  }
}
