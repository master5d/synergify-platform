// Черновая машина: брусок на узел, кубики на детали, раскладка из соответствия. Нужна, чтобы механика картины
// (состояния, подсветка, переходы, доступность) жила до настоящей машины скиллом Anatomy (спека §4, шаг 2).
import type { AssemblyMap, MachineDef, MachineProps } from '@/lib/assembly/types'
import { boxFaces, isoPoint, type BoxFaces } from '@/lib/assembly/iso'

const S = 10
const NODE = 8
const GAP = 4
const BASE_H = 1
const PART = 1.6
const PART_STEP = 2.4
const PART_H = 1.2
const PAD = 12

interface Placed { id: string; x: number; y: number; parts: { id: string; x: number; y: number }[] }

function Box({ f }: { f: BoxFaces }) {
  return (
    <>
      <polygon className="am-left" points={f.left} />
      <polygon className="am-right" points={f.right} />
      <polygon className="am-top" points={f.top} />
    </>
  )
}

export function draftMachine(map: AssemblyMap): MachineDef | null {
  if (map.nodes.length === 0) return null
  const step = NODE + GAP
  const core = map.nodes.filter((n) => !n.optional)
  const extra = map.nodes.filter((n) => n.optional)
  const spots = [
    ...core.map((n, i) => ({ id: n.id, x: (i % 3) * step, y: Math.floor(i / 3) * step })),
    ...extra.map((n, i) => ({ id: n.id, x: 3 * step, y: i * step })),
  ]
  const placed: Placed[] = spots
    .map((s) => ({
      ...s,
      parts: map.parts
        .filter((p) => p.node === s.id)
        .map((p, i) => ({ id: p.id, x: s.x + 1 + (i % 3) * PART_STEP, y: s.y + 1 + Math.floor(i / 3) * PART_STEP }))
        .sort((a, b) => a.x + a.y - (b.x + b.y)),
    }))
    .sort((a, b) => a.x + a.y - (b.x + b.y))

  const corners = placed.flatMap((n) =>
    [[n.x, n.y], [n.x + NODE, n.y], [n.x, n.y + NODE], [n.x + NODE, n.y + NODE]].flatMap(([x, y]) =>
      [isoPoint(x, y, 0, S), isoPoint(x, y, BASE_H + PART_H, S)]))
  const xs = corners.map((c) => c[0])
  const ys = corners.map((c) => c[1])
  const minX = Math.min(...xs) - PAD
  const minY = Math.min(...ys) - PAD
  const viewBox = [minX, minY, Math.max(...xs) + PAD - minX, Math.max(...ys) + PAD - minY].map((v) => +v.toFixed(2)).join(' ')

  function Art({ part, node, title }: MachineProps) {
    return (
      <g>
        {placed.map((n) => (
          <g key={n.id} {...node(n.id)}>
            <title>{title(n.id)}</title>
            <Box f={boxFaces(n.x, n.y, 0, NODE, NODE, BASE_H, S)} />
            {n.parts.map((p) => (
              <g key={p.id} {...part(p.id)}>
                <title>{title(p.id)}</title>
                <Box f={boxFaces(p.x, p.y, BASE_H, PART, PART, PART_H, S)} />
              </g>
            ))}
          </g>
        ))}
      </g>
    )
  }

  return {
    viewBox,
    nodeIds: placed.map((n) => n.id),
    partIds: placed.flatMap((n) => n.parts.map((p) => p.id)),
    Art,
  }
}
