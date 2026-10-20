// packs/one-to-one/manifest.ts
// Манифест курса: ловит только обещающие формы, а не честные отрицания.
import type { ManifestRule } from '../../lib/authoring/manifest'
import { CORE_MANIFEST } from '../../lib/authoring/manifest'

export const MANIFEST: ManifestRule[] = [
  ...CORE_MANIFEST,
  {
    pattern: 'гарантированн(ый|ая|ую|о|ого) (доход|заработ|прибыл)|гарантированно заработа|(доход|прибыль|заработок) гарантирован|guaranteed (income|profit|earnings)|(earn|profit|income) (is )?guaranteed',
    label: 'обещание денег: гарантированный доход',
  },
  {
    pattern: 'поток клиентов|клиенты сами придут|запишутся сами|steady stream of clients|clients will come to you',
    label: 'обещание клиентов: «поток клиентов»',
  },
  {
    // Подлежащее не нужно: «йога исцеляет», «курс вылечит». Честное «не лечит и не исцеляет» пропускается lookbehind'ом.
    pattern: '(?<!не )(исцеляет|исцелит|вылечит|излечивает|излечит)|(?<!not |never )(heals|will heal|cures|will cure)',
    label: 'обещание исцеления',
  },
]
