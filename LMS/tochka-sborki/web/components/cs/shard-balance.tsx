// web/components/cs/shard-balance.tsx
'use client'

import { useShards } from '@/lib/cs/use-shards'

export function ShardBalance({ accent }: { accent?: string }) {
  const { balance, ready } = useShards()
  if (!ready) return null
  return (
    <span
      title="Cognitive Shards"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        color: accent ?? 'var(--text-accent)',
      }}
    >
      <span aria-hidden="true">💎</span>
      {balance}
    </span>
  )
}
