// Контракт страницы лендинга: тесты проверяют видимые поля и маленькие чистые функции без браузера.
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { defaultForm } from '../../lib/retreat-booklet/form'
import { memoryPhotoStore } from '../../lib/retreat-booklet/photos'
import { ExtrasForm, landingFileName } from './extras-form'
import { photoDataUris } from '../retreat-booklet/photos-panel'
import { LANDING_UI } from './ui'
import { BK_UI } from '../retreat-booklet/ui'

const form = defaultForm('2026-01-01', 'ru')

describe('retreat landing render contract', () => {
  it('P01 форма лендинга показывает все поля с maxLength', () => {
    const one = { ...form.landing, numbers: [{ value: '1', label: 'one' }] }
    const html = renderToStaticMarkup(<ExtrasForm locale="ru" value={one} onChange={() => undefined} />)
    // порядок полей: подзаголовок, подпись кнопки, адрес кнопки, цифра, подпись цифры, видео, заметка о цене
    expect([...html.matchAll(/maxLength="(\d+)"/g)].map((m) => Number(m[1]))).toEqual([200, 40, 500, 20, 60, 500, 200])
  })

  it('P02 у адреса кнопки есть подсказка про https и mailto', () => {
    const html = renderToStaticMarkup(<ExtrasForm locale="ru" value={form.landing} onChange={() => undefined} />)
    expect(html).toContain('https://')
    expect(html).toContain('mailto:')
  })

  it('P03 цифр не больше четырёх: кнопка добавить пропадает на четвёртой', () => {
    const nums = (n: number) => ({ ...form.landing, numbers: Array.from({ length: n }, (_, i) => ({ value: String(i), label: 'label' })) })
    const html = (n: number) => renderToStaticMarkup(<ExtrasForm locale="ru" value={nums(n)} onChange={() => undefined} />)
    expect(html(3).match(/\+ добавить/g)).toHaveLength(1)
    expect(html(4).match(/\+ добавить/g)).toBeNull()
  })

  it('P04 на странице нет технических ключей полей', () => {
    const html = renderToStaticMarkup(<ExtrasForm locale="ru" value={form.landing} onChange={() => undefined} />)
    expect(html).not.toContain('subtitle')
    expect(html).not.toContain('videoUrl')
  })

  it('P05 RU и EN ui.ts имеют одинаковый набор ключей', () => {
    expect(Object.keys(LANDING_UI.ru).sort()).toEqual(Object.keys(LANDING_UI.en).sort())
  })

  it('P06 lead RU и EN дословно с последней фразой', () => {
    expect(LANDING_UI.ru.lead).toBe('Страница записи на ретрит из данных вашего буклета: один файл, который открывается на телефоне и выкладывается '
      + 'на любой хостинг. Без трекеров и скриптов. Всё остаётся в этом браузере.')
    expect(LANDING_UI.en.lead).toBe('A sign-up page for your retreat built from your booklet: one file that opens on a phone and can go on any hosting. '
      + 'No trackers or scripts. Everything stays in this browser.')
  })

  it('P07 dataUri в usePhotos возвращает data URI только для фото с правом', async () => {
    const store = memoryPhotoStore()
    await store.put({ id: 'ph-aaaaaaaaaaaa', name: 'a.jpg', width: 1, height: 1, bytes: 1, rights: true, addedAt: '', blob: new Blob(['a'], { type: 'image/jpeg' }) })
    await store.put({ id: 'ph-bbbbbbbbbbbb', name: 'b.jpg', width: 1, height: 1, bytes: 1, rights: false, addedAt: '', blob: new Blob(['b'], { type: 'image/jpeg' }) })
    const result = await photoDataUris(store, ['ph-aaaaaaaaaaaa', 'ph-bbbbbbbbbbbb'], { 'ph-aaaaaaaaaaaa': true, 'ph-bbbbbbbbbbbb': false })
    expect(result['ph-aaaaaaaaaaaa']).toMatch(/^data:image\/jpeg;base64,/)
    expect(result['ph-bbbbbbbbbbbb']).toBeUndefined()
  })

  it('P08 ссылка на лендинг есть в подписях буклета RU и EN', () => {
    expect(BK_UI.ru.openLanding).toBe('Лендинг')
    expect(BK_UI.en.openLanding).toBe('Landing page')
  })

  it('P09 имя файла из названия: латиница и цифры, иначе retreat-landing', () => {
    expect(landingFileName('Quiet Week 2026')).toBe('quiet-week-2026.html')
    expect(landingFileName('Тихий ретрит')).toBe('retreat-landing.html')
  })
})
