'use client'

// Фото буклета: живут только в этом браузере (IndexedDB), в ссылку и файл черновика не попадают. Если хранилища нет
// (приватный режим) — фото держатся в памяти до перезагрузки, и страница прямо об этом говорит.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import type { BookletContent } from '../../lib/retreat-booklet/form'
import {
  checkPhotoFile, memoryPhotoStore, openPhotoStore, photoRightsMap, preparePhoto, type PhotoMeta, type PhotoStore,
} from '../../lib/retreat-booklet/photos'
import { bk } from './ui'
import { button, h2, smallButton } from './styles'

export interface PhotosState {
  photos: PhotoMeta[]
  urls: Record<string, string>
  rights: Record<string, boolean>
  notice: string
  add: (files: FileList | null) => Promise<void>
  remove: (id: string) => Promise<void>
  setRights: (id: string, value: boolean) => Promise<void>
}

export function usePhotos(locale: Locale): PhotosState {
  const t = bk(locale)
  const [store, setStore] = useState<PhotoStore | null>(null)
  const [photos, setPhotos] = useState<PhotoMeta[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true
    openPhotoStore()
      .catch(() => { if (alive) setNotice(t.photoStoreFailed); return memoryPhotoStore() })
      .then(async (s) => { if (!alive) return; setStore(s); setPhotos(await s.list()) })
    return () => { alive = false }
  }, [t.photoStoreFailed])

  // адреса превью: создаются под текущий список и освобождаются при его смене и при уходе со страницы
  useEffect(() => {
    if (!store) return
    let alive = true
    const made: string[] = []
    Promise.all(photos.map(async (p) => {
      const rec = await store.get(p.id)
      if (!rec) return null
      const url = URL.createObjectURL(rec.blob); made.push(url)
      return [p.id, url] as const
    })).then((pairs) => { if (alive) setUrls(Object.fromEntries(pairs.filter((x): x is readonly [string, string] => x !== null))) })
    return () => { alive = false; made.forEach((u) => URL.revokeObjectURL(u)) }
  }, [photos, store])

  const add = useCallback(async (files: FileList | null) => {
    if (!store || !files) return
    let count = photos.length
    for (const file of Array.from(files)) {
      const error = checkPhotoFile(file, count, locale)
      if (error) { setNotice(error); continue }
      try { await store.put(await preparePhoto(file, crypto.randomUUID())); count++ } catch { setNotice(t.photoSaveFailed) }
    }
    setPhotos(await store.list())
  }, [store, photos.length, locale, t.photoSaveFailed])
  const remove = useCallback(async (id: string) => { if (!store) return; await store.remove(id); setPhotos(await store.list()) }, [store])
  const setRights = useCallback(async (id: string, value: boolean) => {
    if (!store) return; await store.setRights(id, value); setPhotos(await store.list())
  }, [store])
  return { photos, urls, rights: photoRightsMap(photos), notice, add, remove, setRights }
}

/** Убирает id фото из всех полей буклета: обложка, место, люди. */
export function withoutPhoto(c: BookletContent, id: string): BookletContent {
  const drop = <P extends { photoId?: string }>(people: P[]) => people.map((p) => (p.photoId === id ? { ...p, photoId: undefined } : p))
  return {
    ...c,
    coverPhotoId: c.coverPhotoId === id ? undefined : c.coverPhotoId,
    placePhotoIds: c.placePhotoIds.filter((x) => x !== id),
    leaders: drop(c.leaders),
    team: drop(c.team),
  }
}

export function PhotosPanel({ locale, state, content, onChange }: {
  locale: Locale; state: PhotosState; content: BookletContent; onChange: (next: BookletContent) => void
}) {
  const t = bk(locale)
  const input = useRef<HTMLInputElement>(null)
  return (
    <section className="bk-noprint" style={{ marginTop: '2rem' }}>
      <h2 style={h2}>{t.photos}</h2>
      <p className="bk-hint">{t.photoHint}</p>
      {state.notice && <p role="alert" className="bk-hint" style={{ color: 'var(--crit)' }}>{state.notice}</p>}
      <div className="bk-row" style={{ margin: '0.6rem 0' }}>
        {/* кнопка, а не label: до выбора файла можно добраться с клавиатуры */}
        <button type="button" style={button} onClick={() => input.current?.click()}>{t.addPhoto}</button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden aria-label={t.addPhoto}
          onChange={(e) => { void state.add(e.target.files); e.target.value = '' }} />
      </div>
      <div className="bk-stack">
        {state.photos.map((p) => (
          <div key={p.id} className="bk-item" style={{ gridTemplateColumns: '72px 1fr', alignItems: 'center' }}>
            {state.urls[p.id] ? <img className="bk-thumb" src={state.urls[p.id]} alt="" /> : <div className="bk-thumb" />}
            <div className="bk-stack" style={{ gap: '0.3rem' }}>
              <span style={{ fontSize: 'var(--text-sm)' }}>{p.name}</span>
              <div className="bk-row">
                <label className="bk-row" style={{ fontSize: 'var(--text-xs)' }}>
                  <input type="checkbox" checked={p.rights} onChange={(e) => void state.setRights(p.id, e.target.checked)} />{t.rights}
                </label>
                {content.coverPhotoId === p.id
                  ? <span className="bk-tag">{t.onCover}</span>
                  : <button type="button" style={smallButton} onClick={() => onChange({ ...content, coverPhotoId: p.id })}>{t.toCover}</button>}
                <button type="button" style={smallButton} onClick={() => { onChange(withoutPhoto(content, p.id)); void state.remove(p.id) }}>{t.remove}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
