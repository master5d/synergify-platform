// Слой сообщества в уроке (intake LMS#13): в конце модуля — «покажи результат практики» в ветке
// модуля (лёгкий peer review: работы живут в группе, не у нас); у урока — записи живых встреч.
import type { CommunityUnitVM } from '@/lib/community'

const linkBtn: React.CSSProperties = {
  display: 'inline-block', background: 'var(--bg-surface)', color: 'var(--text-primary)',
  border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 16px',
  fontSize: 14, textDecoration: 'none', fontFamily: 'inherit',
}
const box: React.CSSProperties = {
  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10,
  padding: '1.25rem', marginTop: '2rem',
}
const h: React.CSSProperties = { margin: '0 0 .5rem', fontSize: '1.05rem', color: 'var(--text-primary)' }

export function CommunityUnit({ vm }: { vm: CommunityUnitVM | null }) {
  if (!vm) return null
  return (
    <>
      {vm.recordings && (
        <section data-community="recordings" style={box}>
          <h2 style={h}>{vm.recordings.heading}</h2>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '.9rem', lineHeight: 1.7 }}>
            {vm.recordings.items.map(r => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>{r.title} ↗</a>
                <span style={{ color: 'var(--text-secondary)' }}> · {r.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {vm.share && (
        <section data-community="share" style={box}>
          <h2 style={h}>{vm.share.heading}</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '.9rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{vm.share.body}</p>
          <a href={vm.share.url} target="_blank" rel="noopener noreferrer" style={linkBtn}>{vm.share.cta} ↗</a>
        </section>
      )}
    </>
  )
}
