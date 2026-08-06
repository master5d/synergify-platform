'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUnitProgress } from '@/lib/unit-progress'

interface Props {
  moduleSlug: string
  units: { slug: string; title: string }[]
  locale?: 'ru' | 'en'
}

export function ModuleRedirect({ moduleSlug, units, locale = 'ru' }: Props) {
  const router = useRouter()
  const { isCompleted, ready } = useUnitProgress()

  useEffect(() => {
    if (!ready) return
    const firstIncomplete = units.find(u => !isCompleted(moduleSlug, u.slug))
    const target = firstIncomplete ?? units[0]
    const prefix = locale === 'en' ? '/en' : ''
    router.replace(`${prefix}/lessons/${moduleSlug}/${target.slug}/`)
  }, [ready, moduleSlug, units, isCompleted, router, locale])

  return null
}
