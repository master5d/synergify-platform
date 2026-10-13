'use client'

import { useEffect, useState } from 'react'
import { assetPath } from '@/lib/base-path'
import type { MachineDef, MachineProps } from '@/lib/assembly/types'
import { ASSEMBLY_MAP } from './assembly-map'
import { PARTS, SHELLS, type Point } from './assembly-machine.data'

const NODE_IDS = ASSEMBLY_MAP.nodes.map((node) => node.id)
const PART_IDS = ASSEMBLY_MAP.parts.map((part) => part.id)

function points(value: readonly Point[]): string {
  return value.map(([x, y]) => `${x},${y}`).join(' ')
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
  return (
    <g>
      {raster ? <image data-am-raster="" href={raster} x="0" y="0" width="1280" height="853" preserveAspectRatio="none" /> : null}
      {ASSEMBLY_MAP.nodes.map(({ id }) => (
        <g key={id} {...node(id)}>
          <title>{title(id)}</title>
          <g data-am-shell="">
            {id === 'chassis' ? <path className="am-area am-shell-area" fillRule="evenodd" d={SHELLS[id] as string} /> : <polygon className="am-area am-shell-area" points={points(SHELLS[id] as Point[])} />}
          </g>
          {ASSEMBLY_MAP.parts.filter((partDef) => partDef.node === id).map(({ id: partId }) => (
            <g key={partId} {...part(partId)}>
              <title>{title(partId)}</title>
              <polygon className="am-area am-part-area" points={points(PARTS[partId])} />
            </g>
          ))}
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
}
