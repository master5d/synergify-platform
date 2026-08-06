'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Nav } from '@/components/nav'
import type { Locale } from '@/lib/dictionaries'
import { clusterAlumni, type AlumniEntry as Entry } from '@/lib/synergem'
import { EFFORT_INTENTS, resolveEffort } from '@/lib/effort'
import { IgiRitual } from '@/components/igi-ritual'
import { SynergemMentor } from '@/components/synergem-mentor'
import { SynergemAcceleration } from '@/components/synergem-acceleration'

const NICHE_LABEL: Record<string, { ru: string; en: string }> = {
  coach: { ru: 'Коучинг и психотерапия', en: 'Coaching & therapy' },
  massage: { ru: 'Телесные практики', en: 'Bodywork' },
  astrology: { ru: 'Астрология и духовные практики', en: 'Astrology & spiritual' },
  content: { ru: 'Контент и блогинг', en: 'Content & blogging' },
  ecommerce: { ru: 'Электронная торговля', en: 'E-commerce' },
  service: { ru: 'Сервисный бизнес', en: 'Service business' },
  tech: { ru: 'Технологии', en: 'Tech' },
}

// Russian plural: 1 → one, 2–4 → few, 0/5+ → many (with 11–14 exception).
function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

export function AlumniClient({ locale }: { locale: Locale }) {
  const router = useRouter()
  const en = locale === 'en'
  const [list, setList] = useState<Entry[]>([])
  const [optin, setOptin] = useState(false)
  const [contact, setContact] = useState('')
  const [blurb, setBlurb] = useState('')
  const [effort, setEffort] = useState<string>('')
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/alumni/me', { credentials: 'include' })
      .then(r => { if (r.status === 401) { router.replace(en ? '/en/login/' : '/login/'); return null } return r.ok ? r.json() : null })
      .then(me => { if (me) { setOptin(!!me.optin); setContact(me.contact ?? ''); setBlurb(me.blurb ?? ''); setEffort(me.effort ?? '') } })
      .catch(() => {})
    fetch('/api/alumni', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { alumni: [] })
      .then(d => { setList(d.alumni ?? []); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [router, en])

  const t = en
    ? { title: 'Synergems', sub: 'Opt-in clusters of fellow learners, gathered by the type of shared effort you choose. Find the people building near you and gather into a synergem — an autonomous group where you amplify each other. Your email is never shown. Every learner here is also a teacher — sharing what you learn is how the synergem grows.', optinLabel: 'List me in the academy synergems', contact: 'How to reach you (handle / link)', blurb: "One line — what you're building or want to gather a synergem around", save: 'Save', saved: 'Saved ✓', empty: 'No one has opted in yet. Be the first to start a synergem.', other: 'Other', effortLegend: 'What do you want to gather a synergem around?', invite: (n: number) => `${n} ${n === 1 ? 'person' : 'people'} building nearby — reach out and gather.` }
    : { title: 'Синергемы', sub: 'Opt-in кластеры соучеников, собранные по выбранному типу общего усилия. Найди тех, кто строит рядом, и собирайтесь в синергему — автономную группу, где вы усиливаете друг друга. Твой email никогда не показывается. Каждый ученик здесь — ещё и учитель: делясь тем, что осваиваешь, ты растишь синергему.', optinLabel: 'Показывать меня в синергемах академии', contact: 'Как с тобой связаться (ник / ссылка)', blurb: 'Одна строка — что строишь или вокруг чего хочешь собрать синергему', save: 'Сохранить', saved: 'Сохранено ✓', empty: 'Пока никто не открылся. Начни синергему первым.', other: 'Другое', effortLegend: 'Вокруг чего хочешь собрать синергему?', invite: (n: number) => `${n} ${plural(n, 'человек строит', 'человека строят', 'человек строят')} рядом — напиши и собирайтесь.` }

  async function save() {
    const r = await fetch('/api/alumni/optin', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optin, contact, blurb, effort: effort || undefined }),
    })
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); const d = await fetch('/api/alumni', { credentials: 'include' }).then(x => x.json()).catch(() => null); if (d) setList(d.alumni ?? []) }
  }

  const clusters = clusterAlumni(list)
  const effortLabel = (k: string) => k === 'other' ? t.other : (resolveEffort(locale, k)?.label ?? k)
  const nicheTag = (k: string | null) => k ? (NICHE_LABEL[k]?.[en ? 'en' : 'ru'] ?? k) : null

  const input: React.CSSProperties = { width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 14 }

  return (
    <>
      <Nav locale={locale} />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>{t.title}</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '56ch' }}>{t.sub}</p>

        <section style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)', marginBottom: '2.5rem' }}>
          <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }}>
            <input type="checkbox" checked={optin} onChange={e => setOptin(e.target.checked)} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.optinLabel}</span>
          </label>
          <div style={{ display: 'grid', gap: '0.7rem' }}>
            <input style={input} value={contact} onChange={e => setContact(e.target.value)} placeholder={t.contact} maxLength={120} />
            <input style={input} value={blurb} onChange={e => setBlurb(e.target.value)} placeholder={t.blurb} maxLength={200} />
            <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
              <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{t.effortLegend}</legend>
              {EFFORT_INTENTS.map(i => {
                const r = resolveEffort(locale, i.key)!
                return (
                  <label key={i.key} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input type="radio" name="effort" checked={effort === i.key} onChange={() => setEffort(i.key)} style={{ marginTop: '0.2rem' }} />
                    <span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{r.label}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}> — {r.line}</span>
                    </span>
                  </label>
                )
              })}
            </fieldset>
            <button onClick={save} style={{ ...input, width: 'auto', cursor: 'pointer', fontWeight: 700, color: 'var(--text-on-accent)', background: 'var(--text-accent)', border: 'none' }}>{saved ? t.saved : t.save}</button>
          </div>
        </section>

        <IgiRitual locale={locale} />

        <SynergemMentor locale={locale} />

        <SynergemAcceleration locale={locale} />

        {loaded && list.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>{t.empty}</p>}
        {clusters.map(({ key: k, entries, count }) => (
          <div key={k} style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-accent)', marginBottom: '0.3rem' }}>
              <span aria-hidden="true">⬡ </span>{effortLabel(k)} · {count}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>{t.invite(count)}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.6rem' }}>
              {entries.map((e, i) => (
                <li key={i} style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '0.8rem' }}>
                  {e.blurb && <div style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{e.blurb}</div>}
                  {e.contact && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-accent)' }}>{e.contact}</div>}
                  {nicheTag(e.niche) && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>⬡ {nicheTag(e.niche)}</div>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </>
  )
}
