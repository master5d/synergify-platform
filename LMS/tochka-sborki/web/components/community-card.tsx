// Слой сообщества (intake LMS#13): карточка «где встречаются ученики» — главная курса и /alumni.
// Чисто презентационная (VM приходит с сервера), поэтому годится и в клиентский /alumni.
// Нет VM (флаг pack'а выключен или ссылки нет) — ничего не рисует.
import type { CommunityEntryVM } from '@/lib/community'

const linkBtn: React.CSSProperties = {
  display: 'inline-block', background: 'var(--bg-surface)', color: 'var(--text-primary)',
  border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 16px',
  fontSize: 14, textDecoration: 'none', fontFamily: 'inherit',
}

export function CommunityCard({ vm, style }: { vm: CommunityEntryVM | null; style?: React.CSSProperties }) {
  if (!vm) return null
  return (
    <section aria-labelledby="community-card-heading" data-community="entry" style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10,
      padding: '1.25rem', ...style,
    }}>
      <h2 id="community-card-heading" style={{ margin: '0 0 .5rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{vm.heading}</h2>
      <p style={{ margin: '0 0 1rem', fontSize: '.9rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{vm.intro}</p>
      <p style={{ margin: vm.note ? '0 0 .75rem' : 0 }}>
        <a href={vm.url} target="_blank" rel="noopener noreferrer" style={linkBtn}>{vm.cta} ↗</a>
      </p>
      {vm.note && <p style={{ margin: 0, fontSize: '.8rem', lineHeight: 1.5, color: 'var(--text-secondary)', opacity: .85 }}>{vm.note}</p>}
    </section>
  )
}
