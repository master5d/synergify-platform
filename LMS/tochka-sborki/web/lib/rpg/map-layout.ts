// web/lib/rpg/map-layout.ts
export interface Pt { x: number; y: number }

// Boustrophedon (snake) layout: nodes fill rows L→R, R→L, L→R… within w×h, `cols` per row.
export function nodePositions(n: number, w: number, h: number, cols: number): Pt[] {
  const rows = Math.ceil(n / cols)
  const padX = w * 0.12, padY = h * 0.12
  const usableW = w - padX * 2, usableH = h - padY * 2
  const stepX = cols > 1 ? usableW / (cols - 1) : 0
  const stepY = rows > 1 ? usableH / (rows - 1) : 0
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols)
    let col = i % cols
    if (row % 2 === 1) col = cols - 1 - col // reverse on odd rows
    pts.push({ x: padX + col * stepX, y: padY + row * stepY })
  }
  return pts
}

// Build an SVG path string snaking through points with smooth quadratic curves.
export function snakePath(pts: Pt[]): string {
  if (pts.length === 0) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1], cur = pts[i]
    const mx = (prev.x + cur.x) / 2, my = (prev.y + cur.y) / 2
    d += ` Q ${prev.x} ${prev.y} ${mx} ${my} T ${cur.x} ${cur.y}`
  }
  return d
}
