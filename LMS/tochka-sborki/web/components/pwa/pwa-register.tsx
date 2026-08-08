'use client'
import { useEffect } from 'react'
import { assetPath, BASE_PATH } from '@/lib/base-path'

/** Registers the service worker after load. Enables installability + offline shell. */
export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onLoad = () => { navigator.serviceWorker.register(assetPath('/sw.js'), { scope: `${BASE_PATH}/` }).catch(() => { /* SW optional */ }) }
    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [])
  return null
}
