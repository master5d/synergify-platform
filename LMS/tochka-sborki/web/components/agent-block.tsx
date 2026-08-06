'use client'
import { useState, useEffect } from 'react'

export type Stack = 'claude' | 'sovereign' | 'cloud-oss' | 'behind-gfw'

const VALID_STACKS: Stack[] = ['claude', 'sovereign', 'cloud-oss', 'behind-gfw']

interface Props {
  stack: Stack
  children: React.ReactNode
}

export function AgentBlock({ stack, children }: Props) {
  const [stored, setStored] = useState<Stack | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let raw: string | null = null
    try { raw = localStorage.getItem('stack') } catch { /* ignore */ }
    const valid = VALID_STACKS.includes(raw as Stack) ? (raw as Stack) : null
    setStored(valid)
    setReady(true)
  }, [])

  if (!ready) return <>{children}</>
  if (stored && stored !== stack) return null
  return <>{children}</>
}
