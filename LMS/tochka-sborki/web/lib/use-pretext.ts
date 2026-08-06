'use client'

import { useEffect, useState } from 'react'
import {
  prepareWithSegments,
  measureLineStats,
  measureNaturalWidth,
} from '@chenglou/pretext'

/**
 * Кегль из canvas-спеки шрифта («14px 'Geist Mono', monospace» → 14).
 *
 * Вынесено из эффекта, потому что это единственная арифметика в хуке — всё
 * остальное меряет canvas, которого в тестах нет. Ошибка здесь тихая: подпись
 * останется на экране, просто высота строки посчитается не от того кегля.
 */
export function fontSizeOf(font: string, fallback = 16): number {
  // Знак обязан входить в матч: без него «-4px» читалось как «4px» —
  // отрицательный кегль проходил проверку и давал отрицательную высоту строки.
  const m = font.match(/(-?\d+(?:\.\d+)?)px/)
  const px = m ? parseFloat(m[1]) : NaN
  return Number.isFinite(px) && px > 0 ? px : fallback
}

/** Высота строки в пикселях: кегль × множитель. */
export function lineHeightPx(font: string, lineHeight: number): number {
  return fontSizeOf(font) * lineHeight
}

export type Measurement = {
  ready: boolean
  naturalWidth: number     // width on a single line (no wrap)
  shrunkWidth: number      // tightest width given maxWidth wrap
  lineCount: number
  lineHeight: number
}

/**
 * Measure text via Pretext. SSR-safe (returns {ready:false} until effect runs).
 * font is a canvas font spec, e.g. "14px 'Geist Mono', monospace".
 */
export function useTextMeasurement(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight = 1.5,
): Measurement {
  const [m, setM] = useState<Measurement>({
    ready: false,
    naturalWidth: 0,
    shrunkWidth: maxWidth,
    lineCount: 1,
    lineHeight: 0,
  })

  useEffect(() => {
    let cancelled = false

    const measure = () => {
      try {
        const prepared = prepareWithSegments(text, font)
        const px = lineHeightPx(font, lineHeight)
        const natural = measureNaturalWidth(prepared)
        const stats = measureLineStats(prepared, maxWidth)
        if (!cancelled) {
          setM({
            ready: true,
            naturalWidth: natural,
            shrunkWidth: stats.maxLineWidth,
            lineCount: stats.lineCount,
            lineHeight: px,
          })
        }
      } catch {
        // Pretext failed (e.g. font not loaded yet) — leave previous state
      }
    }

    // First pass immediately; refire after fonts.ready so measurements are accurate
    measure()
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => { if (!cancelled) measure() })
    }

    return () => { cancelled = true }
  }, [text, font, maxWidth, lineHeight])

  return m
}
