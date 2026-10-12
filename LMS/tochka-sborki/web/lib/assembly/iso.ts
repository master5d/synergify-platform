// Изометрический проектор черновой машины: x — вправо-вниз, y — влево-вниз, z — вверх, угол 30°.
const COS30 = Math.cos(Math.PI / 6)

export function isoPoint(x: number, y: number, z: number, scale = 1): [number, number] {
  return [(x - y) * COS30 * scale, ((x + y) * 0.5 - z) * scale]
}

export interface BoxFaces { top: string; left: string; right: string }

/** Видимые грани бруска [x, x+w] × [y, y+d] × [z, z+h]: верх, грань y+d (левая), грань x+w (правая). */
export function boxFaces(x: number, y: number, z: number, w: number, d: number, h: number, scale = 1): BoxFaces {
  const p = (a: number, b: number, c: number) => isoPoint(a, b, c, scale).map((v) => +v.toFixed(2)).join(',')
  return {
    top: [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)].join(' '),
    left: [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)].join(' '),
    right: [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)].join(' '),
  }
}
