import type { Locale } from '@/lib/intake/types'
import type { AutomationVerdict } from './automation-check'
import { AUTOMATION_CHECK } from '@/lib/course/automation-check'

// Копия — course-data в pack'е (packs/<pack>/course/automation-check.ts, intake LMS#10);
// этот builder и <AutomationVerdictCard> — движок. Мирует intake-gate-content.

export interface AutomationCheckVerdictContent {
  badge: string
  headline: string
  body: string
}

export interface AutomationCheckContent {
  eyebrow: string
  heading: string
  lead: string
  incomplete: string
  uncertainBuild: string
  monthUnit: string
  hourUnit: string
  verdicts: Record<AutomationVerdict, AutomationCheckVerdictContent>
}

export function buildAutomationCheckContent(locale: Locale): AutomationCheckContent {
  const T = AUTOMATION_CHECK
  const verdicts = Object.fromEntries(
    (Object.entries(T.verdicts) as [AutomationVerdict, typeof T.verdicts[AutomationVerdict]][]).map(([k, v]) => [
      k,
      { badge: v.badge[locale], headline: v.headline[locale], body: v.body[locale] },
    ]),
  ) as Record<AutomationVerdict, AutomationCheckVerdictContent>

  return {
    eyebrow: T.eyebrow[locale],
    heading: T.heading[locale],
    lead: T.lead[locale],
    incomplete: T.incomplete[locale],
    uncertainBuild: T.uncertainBuild[locale],
    monthUnit: T.monthUnit[locale],
    hourUnit: T.hourUnit[locale],
    verdicts,
  }
}
