import { describe, it, expect } from 'vitest'
import { boxFaces, isoPoint } from './iso'

describe('изометрия', () => {
  it('ось x уходит вправо-вниз, ось z — вверх', () => {
    const [x, y] = isoPoint(1, 0, 0)
    expect(x).toBeCloseTo(0.866, 3)
    expect(y).toBeCloseTo(0.5, 3)
    expect(isoPoint(0, 0, 1)).toEqual([0, -1])
    expect(isoPoint(1, 1, 0, 10)[0]).toBeCloseTo(0, 6)
  })

  it('boxFaces — три видимые грани по четыре точки', () => {
    const f = boxFaces(0, 0, 0, 2, 2, 1, 10)
    for (const face of [f.top, f.left, f.right]) expect(face.split(' ')).toHaveLength(4)
    expect(f.top.split(' ')[0]).toBe('0,-10')
  })
})
