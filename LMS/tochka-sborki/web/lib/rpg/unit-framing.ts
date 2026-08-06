import type { SkinPack, UnitFraming } from './types'

export function getUnitFraming(
  pack: SkinPack | null,
  moduleSlug: string,
  unitSlug: string,
): UnitFraming | null {
  return pack?.units?.[`${moduleSlug}/${unitSlug}`] ?? null
}
