// Лимиты и константы для медиа лендинга
export const LANDING_LIMITS = { heavyBytes: 8_000_000, urlLength: 500 } as const

// Проверка корректности ссылки кнопки действия (https с хостом или mailto)
export function ctaUrlOk(url: string): boolean {
  if (typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed || trimmed.length > LANDING_LIMITS.urlLength) return false
  if (/\s/.test(trimmed)) return false

  if (trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      if (parsed.protocol !== 'https:') return false
      const host = parsed.hostname
      return host.includes('.') && !host.startsWith('.') && !host.endsWith('.')
    } catch {
      return false
    }
  }

  if (trimmed.startsWith('mailto:')) {
    const address = trimmed.slice(7)
    const atIndex = address.indexOf('@')
    if (atIndex <= 0) return false
    const afterAt = address.slice(atIndex + 1)
    const dotIndex = afterAt.indexOf('.')
    if (dotIndex <= 0 || dotIndex === afterAt.length - 1) return false
    return true
  }

  return false
}

// Преобразование ссылок YouTube и Vimeo в адрес встраиваемого iframe
export function videoEmbedUrl(url: string): string | null {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed.startsWith('https://')) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null

  const host = parsed.hostname
  const parts = parsed.pathname.split('/').filter(Boolean)

  if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
    let id: string | null = null
    if (parts.length === 1 && parts[0] === 'watch') {
      id = parsed.searchParams.get('v')
    } else if (parts.length === 2 && (parts[0] === 'shorts' || parts[0] === 'embed')) {
      id = parts[1]
    }
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
      return `https://www.youtube-nocookie.com/embed/${id}`
    }
    return null
  }

  if (host === 'youtu.be') {
    if (parts.length === 1) {
      const id = parts[0]
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
        return `https://www.youtube-nocookie.com/embed/${id}`
      }
    }
    return null
  }

  if (host === 'vimeo.com' || host === 'www.vimeo.com') {
    if (parts.length === 1 && /^\d+$/.test(parts[0])) {
      return `https://player.vimeo.com/video/${parts[0]}?dnt=1`
    }
    return null
  }

  if (host === 'player.vimeo.com') {
    if (parts.length === 2 && parts[0] === 'video' && /^\d+$/.test(parts[1])) {
      return `https://player.vimeo.com/video/${parts[1]}?dnt=1`
    }
    return null
  }

  return null
}

// Преобразование Blob в data URI через arrayBuffer и чанкинг base64
export async function blobToDataUri(blob: Blob): Promise<string> {
  const mime = blob.type || 'application/octet-stream'
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const chunkSize = 8192
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return `data:${mime};base64,${btoa(binary)}`
}

// Размер HTML-строки в байтах UTF-8
export function htmlBytes(html: string): number {
  return new TextEncoder().encode(html).length
}
