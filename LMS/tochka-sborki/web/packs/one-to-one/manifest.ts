// packs/one-to-one/manifest.ts
// Манифест курса: ловит только обещающие формы, а не честные отрицания.
import type { ManifestRule } from '../../lib/authoring/manifest'
import { CORE_MANIFEST } from '../../lib/authoring/manifest'

export const MANIFEST: ManifestRule[] = [
  ...CORE_MANIFEST,
  {
    pattern: 'гарантированн(ый|о|ого) (доход|заработ|прибыл)|гарантированно заработа|guaranteed (income|profit|earnings)|(earn|profit) guaranteed',
    label: 'обещание денег: гарантированный доход',
  },
  {
    pattern: 'поток клиентов|клиенты сами придут|запишутся сами|steady stream of clients|clients will come to you',
    label: 'обещание клиентов: «поток клиентов»',
  },
  {
    pattern: '(сессия|практика|метод) (исцеляет|исцелит|вылечит)|(session|practice|method) (heals|will heal|cures)',
    label: 'обещание исцеления',
  },
]
