import { parseMarkdown } from './md'

export type ManifestEntry = { id: string; p: string | null; th: string; ch: string | null }
export type Manifest = { v: 1; pages: Record<string, ManifestEntry>; anchors: Record<string, string> }

export const EMPTY_MANIFEST: Manifest = { v: 1, pages: {}, anchors: {} }
export const MANIFEST_TITLE = 'notion-kb · manifest (не публиковать)'

export function encodeManifest(manifest: Manifest, chunk = 1800): string {
  const json = JSON.stringify(manifest)
  const chunks: string[] = []
  for (let i = 0; i < json.length; i += chunk) chunks.push(json.slice(i, i + chunk))
  return chunks.map((part) => `\`\`\`\n${part}\n\`\`\``).join('\n')
}

export function decodeManifest(markdown: string): Manifest {
  if (!markdown.trim()) return { v: 1, pages: {}, anchors: {} }
  try {
    const tree = parseMarkdown(markdown)
    const json = tree.children.filter((node) => node.type === 'code').map((node) => node.value).join('')
    const value = JSON.parse(json) as Manifest
    if (value?.v !== 1 || !value.pages || !value.anchors || typeof value.pages !== 'object' || typeof value.anchors !== 'object') throw new Error('bad manifest')
    return value
  } catch (error) {
    throw new Error(`манифест повреждён: ${error instanceof Error ? error.message : String(error)}`)
  }
}
