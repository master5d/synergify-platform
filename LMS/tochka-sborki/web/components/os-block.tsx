'use client'
import { useState, useEffect } from 'react'
import { effectiveOs, type Os } from '@/lib/os-pref'

interface Props {
  os: Os
  children: React.ReactNode
}

export function OsBlock({ os, children }: Props) {
  const [active, setActive] = useState<Os | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Effective OS = saved choice, else auto-detected. Blocks for the other OS hide.
    setActive(effectiveOs())
    setReady(true)
  }, [])

  if (!ready) return <>{children}</>
  if (active && active !== os) return null
  return <>{children}</>
}
