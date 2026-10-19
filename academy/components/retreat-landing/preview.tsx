import { useMemo } from 'react'

export function LandingPreview({ html, phone, title }: { html: string; phone: boolean; title: string }) {
  const style = useMemo(() => ({ display: 'block', width: phone ? '390px' : '100%', maxWidth: '100%', minHeight: '700px',
    border: '1px solid var(--border-soft)', background: '#fff' }), [phone])
  // в странице нет скриптов (рендер их не пишет, тексты экранированы); allow-scripts нужен только вложенному плееру видео,
  // а без allow-same-origin предпросмотр не получает доступа к странице инструмента
  return <iframe title={title} sandbox="allow-scripts allow-popups" srcDoc={html} style={style} />
}
