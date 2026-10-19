import { describe, expect, it } from 'vitest'
import {
  checkPhotoFile,
  fitSize,
  isPhotoId,
  memoryPhotoStore,
  photoId,
  photoRightsMap,
  PhotoRecord
} from './photos'

describe('хранилище фото буклета ретрита (retreat-booklet/photos)', () => {
  it('fitSize(4000, 3000) масштабирует до 1600x1200', () => {
    expect(fitSize(4000, 3000)).toEqual({ width: 1600, height: 1200 })
  })

  it('портрет 3000x4000 масштабирует до 1200x1600', () => {
    expect(fitSize(3000, 4000)).toEqual({ width: 1200, height: 1600 })
  })

  it('маленькое 800x600 не увеличивается', () => {
    expect(fitSize(800, 600)).toEqual({ width: 800, height: 600 })
  })

  it('photoId даёт формат ^ph-[a-z0-9]{12}$ и isPhotoId его принимает, отвергает ph-ABC', () => {
    const id = photoId('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
    expect(id).toMatch(/^ph-[a-z0-9]{12}$/)
    expect(isPhotoId(id)).toBe(true)
    expect(isPhotoId('ph-ABC')).toBe(false)
    expect(isPhotoId('ph-short')).toBe(false)
  })

  it('checkPhotoFile: heic возвращает сообщение с просьбой сохранить как JPEG для RU и EN', () => {
    const file = { name: 'sample.heic', type: 'image/heic', size: 1_000_000 }
    expect(checkPhotoFile(file, 0, 'ru')).toBe(
      'Это не JPEG, PNG или WebP. Сохраните фото как JPEG и выберите снова.'
    )
    expect(checkPhotoFile(file, 0, 'en')).toBe(
      'This is not a JPEG, PNG or WebP. Save the photo as JPEG and pick it again.'
    )
  })

  it('checkPhotoFile: 30 МБ возвращает ошибку «больше 25 МБ» для RU и EN', () => {
    const file = { name: 'big.jpg', type: 'image/jpeg', size: 30_000_000 }
    expect(checkPhotoFile(file, 0, 'ru')).toBe('Файл больше 25 МБ.')
    expect(checkPhotoFile(file, 0, 'en')).toBe('The file is larger than 25 MB.')
  })

  it('checkPhotoFile: 13-е фото возвращает ошибку превышения лимита для RU и EN', () => {
    const file = { name: 'photo.jpg', type: 'image/jpeg', size: 2_000_000 }
    expect(checkPhotoFile(file, 12, 'ru')).toBe('Уже 12 фото — больше в буклет не поместится.')
    expect(checkPhotoFile(file, 12, 'en')).toBe(
      'There are already 12 photos — the booklet has no room for more.'
    )
  })

  it('checkPhotoFile: jpeg 2 МБ при 3 фото возвращает null для RU и EN', () => {
    const file = { name: 'photo.jpg', type: 'image/jpeg', size: 2_000_000 }
    expect(checkPhotoFile(file, 3, 'ru')).toBeNull()
    expect(checkPhotoFile(file, 3, 'en')).toBeNull()
  })

  it('memoryPhotoStore: put -> list без blob -> setRights -> get видит rights: true -> remove -> list пуст', async () => {
    const store = memoryPhotoStore()
    const mockBlob = new Blob(['test-binary-data'], { type: 'image/jpeg' })
    const record: PhotoRecord = {
      id: 'ph-0123456789ab',
      name: 'cover.jpg',
      width: 1600,
      height: 1200,
      bytes: 1234,
      rights: false,
      addedAt: '2026-10-19T07:00:00.000Z',
      blob: mockBlob
    }

    await store.put(record)

    const list = await store.list()
    expect(list).toHaveLength(1)
    expect(list[0]).toEqual({
      id: 'ph-0123456789ab',
      name: 'cover.jpg',
      width: 1600,
      height: 1200,
      bytes: 1234,
      rights: false,
      addedAt: '2026-10-19T07:00:00.000Z'
    })
    expect('blob' in list[0]).toBe(false)

    await store.setRights('ph-0123456789ab', true)

    const updated = await store.get('ph-0123456789ab')
    expect(updated).not.toBeNull()
    expect(updated?.rights).toBe(true)
    expect(updated?.blob).toBe(mockBlob)

    await store.remove('ph-0123456789ab')

    const empty = await store.list()
    expect(empty).toEqual([])
  })

  it('photoRightsMap формирует карту прав для проверок буклета', () => {
    const list = [
      {
        id: 'ph-111111111111',
        name: 'a.jpg',
        width: 100,
        height: 100,
        bytes: 100,
        rights: true,
        addedAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'ph-222222222222',
        name: 'b.jpg',
        width: 200,
        height: 200,
        bytes: 200,
        rights: false,
        addedAt: '2026-01-02T00:00:00.000Z'
      }
    ]
    expect(photoRightsMap(list)).toEqual({
      'ph-111111111111': true,
      'ph-222222222222': false
    })
  })

  it('memoryPhotoStore: list отдаёт фото по addedAt, а не по порядку добавления', async () => {
    const store = memoryPhotoStore()
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    const base = { width: 10, height: 10, bytes: 1, rights: false, blob }
    await store.put({ ...base, id: 'ph-bbbbbbbbbbbb', name: 'b.jpg', addedAt: '2026-01-02T00:00:00.000Z' })
    await store.put({ ...base, id: 'ph-aaaaaaaaaaaa', name: 'a.jpg', addedAt: '2026-01-01T00:00:00.000Z' })
    expect((await store.list()).map((m) => m.id)).toEqual(['ph-aaaaaaaaaaaa', 'ph-bbbbbbbbbbbb'])
  })
})
