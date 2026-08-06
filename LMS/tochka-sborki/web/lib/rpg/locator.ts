import type { ZoneVM } from './types'

export interface LocatorVM {
  finished: boolean
  hereIndex: number | null   // 1-based position of the current module; null when finished
  total: number
  zoneName: string | null    // localized name of the current zone; null when finished
  caption: string            // ready-to-render line shown under the map
}

export function buildLocator(zones: ZoneVM[], locale: 'ru' | 'en'): LocatorVM {
  const total = zones.length
  const current = zones.find(z => z.status === 'current')

  if (!current) {
    return {
      finished: true,
      hereIndex: null,
      total,
      zoneName: null,
      caption: locale === 'en' ? '🏁 Course complete' : '🏁 Курс пройден',
    }
  }

  const hereIndex = current.order + 1
  const zoneName = current.zoneName
  const caption = locale === 'en'
    ? `📍 You are here: ${zoneName} · module ${hereIndex} of ${total}`
    : `📍 Вы тут: ${zoneName} · модуль ${hereIndex} из ${total}`

  return { finished: false, hereIndex, total, zoneName, caption }
}
