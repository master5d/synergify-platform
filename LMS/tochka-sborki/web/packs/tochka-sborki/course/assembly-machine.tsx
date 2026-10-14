'use client'

import { useEffect, useState, type ReactElement } from 'react'
import { assetPath } from '@/lib/base-path'
import type { MachineDef, MachineProps } from '@/lib/assembly/types'
import { ASSEMBLY_MAP } from './assembly-map'
import { PART_MARKERS, PARTS, SHELL_MARKERS, SHELLS, type Point, type Polygon } from './assembly-machine.data'

const NODE_IDS = ASSEMBLY_MAP.nodes.map((node) => node.id)
const PART_IDS = ASSEMBLY_MAP.parts.map((part) => part.id)
const NODE_OF_PART = new Map(ASSEMBLY_MAP.parts.map((part) => [part.id, part.node]))

function points(value: readonly Point[]): string {
  return value.map(([x, y]) => `${x},${y}`).join(' ')
}

function polygonPath(value: readonly Point[]): string {
  return value.length ? `M ${value.map(([x, y]) => `${x} ${y}`).join(' L ')} Z` : ''
}

function areaShape(id: string, polygon: Polygon): ReactElement {
  return id === 'chassis' ? <path className="am-area am-shell-area" d={polygonPath(polygon)} /> : <polygon className="am-area am-shell-area" points={points(polygon)} />
}

function diamond([x, y]: Point): string {
  return points([[x, y - 12], [x + 12, y], [x, y + 12], [x - 12, y]])
}

function useRasterAsset(): string | null {
  const [asset, setAsset] = useState<string | null>(null)
  useEffect(() => {
    const root = document.documentElement
    const sync = () => {
      if (root.dataset.lite === 'on') { setAsset(null); return }
      setAsset(assetPath(root.dataset.theme === 'dark' ? '/assembly/car-dark.webp' : '/assembly/car-light.webp'))
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-lite'] })
    return () => observer.disconnect()
  }, [])
  return asset
}

function Art({ part, node, title }: MachineProps) {
  const raster = useRasterAsset()
  const currentPart = ASSEMBLY_MAP.parts.find(({ id }) => part(id)['data-am-current'] === 'true')?.id
  const currentNode = ASSEMBLY_MAP.nodes.find(({ id }) => node(id)['data-am-current'] === 'true')?.id
  // Деталь, которой нет на картинке, своей зоны не имеет — прожектор ложится на корпус её узла.
  const spotlight = currentPart ? PARTS[currentPart] ?? SHELLS[NODE_OF_PART.get(currentPart) ?? ''] : currentNode ? SHELLS[currentNode] : undefined
  return (
    <g>
      {raster ? <image data-am-raster="" href={raster} x="0" y="0" width="1280" height="853" preserveAspectRatio="none" /> : null}
      {spotlight ? <defs>
        <filter id="am-spotlight-blur" x="-8%" y="-8%" width="116%" height="116%"><feGaussianBlur stdDeviation="7" /></filter>
        <mask id="am-spotlight-mask" maskUnits="userSpaceOnUse">
          <rect width="1280" height="853" fill="white" />
          <path d={polygonPath(spotlight)} fill="black" filter="url(#am-spotlight-blur)" />
        </mask>
      </defs> : null}
      {spotlight ? <rect className="am-spotlight" width="1280" height="853" mask="url(#am-spotlight-mask)" /> : null}
      {ASSEMBLY_MAP.nodes.map(({ id }) => (
        <g key={id} {...node(id)}>
          <title>{title(id)}</title>
          <g data-am-shell="">
            {areaShape(id, SHELLS[id])}
            <polygon className="am-marker am-shell-marker" data-am-marker="shell" points={diamond(SHELL_MARKERS[id])} />
          </g>
          {ASSEMBLY_MAP.parts.filter((partDef) => partDef.node === id).map(({ id: partId }) => {
            const area = PARTS[partId]
            const marker = PART_MARKERS[partId]
            return (
              <g key={partId} {...part(partId)}>
                <title>{title(partId)}</title>
                {area && marker ? <>
                  <polygon className="am-area am-part-area" points={points(area)} />
                  <circle className="am-marker am-part-marker" data-am-marker="part" cx={marker[0]} cy={marker[1]} r="11" />
                </> : null}
              </g>
            )
          })}
        </g>
      ))}
    </g>
  )
}

export const MACHINE: MachineDef = {
  viewBox: '0 0 1280 853',
  nodeIds: NODE_IDS,
  partIds: PART_IDS,
  Art,
  // Основа сгенерирована (дорожка codex image_gen, C2PA в паспорте генерации) — исключение владельца 2026-10-12
  // при условии честной подписи (паспорт docs/superpowers/specs/2026-10-12-assembly-car-profile.md).
  credit: { ru: 'Иллюстрация сгенерирована ИИ', en: 'AI-generated illustration' },
}
