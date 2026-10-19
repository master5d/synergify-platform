'use client'
import { useEffect, useState } from 'react'
import { checkPhotoFile, memoryPhotoStore, openPhotoStore, photoRightsMap, preparePhoto, type PhotoMeta, type PhotoStore } from '../../lib/retreat-booklet/photos'
import type { Locale } from '../../lib/dictionaries'
import type { BookletContent } from '../../lib/retreat-booklet/form'
import { bk } from './ui'

export function PhotosPanel({ locale, content, onChange }: { locale: Locale; content: BookletContent; onChange: (next: BookletContent) => void }) {
  const t = bk(locale); const [store, setStore] = useState<PhotoStore | null>(null)
  const [photos, setPhotos] = useState<PhotoMeta[]>([]); const [thumbs, setThumbs] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  useEffect(() => { let alive = true; openPhotoStore().catch(() => {
    const message = locale === 'ru' ? 'Хранилище фото недоступно — фото будут доступны только в этом браузере.'
      : 'Photo storage is unavailable — photos will stay available only in this browser.'
    setNotice(message)
    return memoryPhotoStore()
  }).then((s) => {
    if (alive) { setStore(s); s.list().then(setPhotos) }
  }); return () => { alive = false } }, [])
  useEffect(() => { if (!store) return; let alive = true; const urls: string[] = []
    Promise.all(photos.map(async (photo) => { const record = await store.get(photo.id); if (!record) return [photo.id, ''] as const
      const url = URL.createObjectURL(record.blob); urls.push(url); return [photo.id, url] as const
    })).then((entries) => { if (alive) setThumbs(Object.fromEntries(entries.filter(([, url]) => url))) })
    return () => { alive = false; urls.forEach((url) => URL.revokeObjectURL(url)) }
  }, [photos, store])
  const add = async (files: FileList | null) => { if (!store || !files) return
    for (const file of Array.from(files)) { const error = checkPhotoFile(file, photos.length, locale)
      if (error) { setNotice(error); continue }; try { const photo = await preparePhoto(file, crypto.randomUUID()); await store.put(photo) }
      catch { setNotice(locale === 'ru' ? 'Не удалось сохранить фото.' : 'Could not save the photo.') } }
    setPhotos(await store.list()) }
  const rights = photoRightsMap(photos)
  return <section className="bk-panel bk-noprint"><h2>{locale === 'ru' ? 'Фото' : 'Photos'}</h2><p className="bk-meta">{t.photoHint}</p>
    <button type="button" onClick={() => document.getElementById('bk-photo-input')?.click()}>{locale === 'ru' ? 'Выбрать файл' : 'Choose file'}</button>
    <input id="bk-photo-input" hidden type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => void add(e.target.files)} />
    {notice && <p role="alert">{notice}</p>}<div>{photos.map((p) => <div className="bk-card" key={p.id}><div className="bk-row">
      {thumbs[p.id] && <img src={thumbs[p.id]} alt="" width="80" height="60" />}<strong>{p.name}</strong>
      <label><input type="checkbox" checked={rights[p.id] === true} onChange={(e) => { if (store) void store.setRights(p.id, e.target.checked)
        .then(() => store.list().then(setPhotos)) }} /> {t.rights}</label>
      <button type="button" onClick={() => { if (store) void store.remove(p.id).then(() => { onChange({ ...content,
        placePhotoIds: content.placePhotoIds.filter((id) => id !== p.id), coverPhotoId: content.coverPhotoId === p.id ? undefined : content.coverPhotoId });
        return store.list().then(setPhotos) }) }}>{t.delete}</button>
    </div></div>)}</div></section>
}
