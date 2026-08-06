// Minimal service worker for installability + offline shell.
// Strategy: network-first (so a frequently-updated course never serves stale pages),
// falling back to cache, then to a cached offline shell. Bump CACHE on shell changes.
const CACHE = 'ts-lms-v1'
const SHELL = ['/', '/offline/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  event.respondWith(
    fetch(request)
      .then((res) => {
        // Cache successful same-origin responses for offline fallback.
        if (res.ok && new URL(request.url).origin === self.location.origin) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        }
        return res
      })
      .catch(() =>
        caches.match(request).then((hit) => hit || (request.mode === 'navigate' ? caches.match('/offline/') : undefined))
      )
  )
})
