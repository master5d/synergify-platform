// Хранилище фото буклета ретрита в браузере (IndexedDB и запасной вариант в памяти).
// Фото уменьшаются на клиенте и не покидают браузер.

export interface PhotoMeta {
  id: string
  name: string
  width: number
  height: number
  bytes: number
  rights: boolean
  addedAt: string
}

export interface PhotoRecord extends PhotoMeta {
  blob: Blob
}

export interface PhotoStore {
  put(record: PhotoRecord): Promise<void>
  get(id: string): Promise<PhotoRecord | null>
  list(): Promise<PhotoMeta[]>
  remove(id: string): Promise<void>
  setRights(id: string, rights: boolean): Promise<void>
}

export const PHOTO_LIMITS = {
  count: 12,
  maxSide: 1600,
  quality: 0.85,
  inputBytes: 25_000_000
} as const

// Уменьшение с сохранением пропорций, целые пиксели, не увеличивает маленькие; ширина и высота >= 1
export function fitSize(
  width: number,
  height: number,
  maxSide: number = PHOTO_LIMITS.maxSide
): { width: number; height: number } {
  const w = Math.max(1, Math.round(width))
  const h = Math.max(1, Math.round(height))
  if (w <= maxSide && h <= maxSide) {
    return { width: w, height: h }
  }
  const ratio = Math.min(maxSide / w, maxSide / h)
  return {
    width: Math.max(1, Math.round(w * ratio)),
    height: Math.max(1, Math.round(h * ratio))
  }
}

// Формирует идентификатор фото: ph- и первые 12 символов [a-z0-9] из uuid
export function photoId(uuid: string): string {
  const clean = uuid.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (clean.length < 12) {
    throw new Error('UUID должен содержать как минимум 12 символов [a-z0-9]')
  }
  return 'ph-' + clean.slice(0, 12)
}

// Проверяет соответствие строки формату id фото: ^ph-[a-z0-9]{12}$
export function isPhotoId(s: unknown): s is string {
  return typeof s === 'string' && /^ph-[a-z0-9]{12}$/.test(s)
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

// Проверка файла перед добавлением: формат, размер, лимит количества фото в буклете
export function checkPhotoFile(
  file: { name: string; type: string; size: number },
  existingCount: number,
  lang: 'ru' | 'en'
): string | null {
  const type = file.type ? file.type.toLowerCase() : ''
  if (!ALLOWED_MIME_TYPES.has(type)) {
    return lang === 'ru'
      ? 'Это не JPEG, PNG или WebP. Сохраните фото как JPEG и выберите снова.'
      : 'This is not a JPEG, PNG or WebP. Save the photo as JPEG and pick it again.'
  }
  if (file.size > PHOTO_LIMITS.inputBytes) {
    return lang === 'ru'
      ? 'Файл больше 25 МБ.'
      : 'The file is larger than 25 MB.'
  }
  if (existingCount >= PHOTO_LIMITS.count) {
    return lang === 'ru'
      ? 'Уже 12 фото — больше в буклет не поместится.'
      : 'There are already 12 photos — the booklet has no room for more.'
  }
  return null
}

// Карта прав на использование фото по их id для валидации буклета
export function photoRightsMap(list: PhotoMeta[]): Record<string, boolean> {
  const map: Record<string, boolean> = {}
  for (const item of list) {
    map[item.id] = item.rights
  }
  return map
}

// Подготовка фото в браузере: масштабирование, учёт EXIF, конвертация в JPEG Blob
export async function preparePhoto(file: File, uuid: string): Promise<PhotoRecord> {
  const id = photoId(uuid)
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const { width, height } = fitSize(bitmap.width, bitmap.height, PHOTO_LIMITS.maxSide)

  let blob: Blob
  try {
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Не удалось получить 2d контекст OffscreenCanvas')
      }
      ctx.drawImage(bitmap, 0, 0, width, height)
      blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: PHOTO_LIMITS.quality })
    } else if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Не удалось получить 2d контекст canvas')
      }
      ctx.drawImage(bitmap, 0, 0, width, height)
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) resolve(result)
            else reject(new Error('Не удалось преобразовать canvas в blob'))
          },
          'image/jpeg',
          PHOTO_LIMITS.quality
        )
      })
    } else {
      throw new Error('Canvas не поддерживается в текущем окружении')
    }
  } finally {
    if (typeof bitmap.close === 'function') {
      bitmap.close()
    }
  }

  return {
    id,
    name: file.name,
    width,
    height,
    bytes: blob.size,
    rights: false,
    addedAt: new Date().toISOString(),
    blob
  }
}

// Реализация хранилища в IndexedDB
export function openPhotoStore(dbName = 'retreat-booklet-photos'): Promise<PhotoStore> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined' || !indexedDB) {
      reject(new Error('IndexedDB недоступна в этом браузере'))
      return
    }

    let req: IDBOpenDBRequest
    try {
      req = indexedDB.open(dbName, 1)
    } catch {
      reject(new Error('Не удалось открыть базу данных IndexedDB'))
      return
    }

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' })
      }
    }

    req.onerror = () => {
      reject(req.error ?? new Error('Не удалось открыть базу данных IndexedDB'))
    }

    req.onblocked = () => {
      reject(new Error('Открытие базы данных IndexedDB заблокировано'))
    }

    req.onsuccess = () => {
      const db = req.result

      const store: PhotoStore = {
        put(record: PhotoRecord): Promise<void> {
          return new Promise((res, rej) => {
            const tx = db.transaction('photos', 'readwrite')
            tx.onerror = () => rej(tx.error ?? new Error('Ошибка записи в IndexedDB'))
            tx.oncomplete = () => res()
            // квота кончилась — транзакция прерывается событием abort, а не error
            tx.onabort = () => rej(tx.error ?? new Error('Запись в IndexedDB прервана: возможно, в браузере нет места'))
            tx.objectStore('photos').put(record)
          })
        },

        get(id: string): Promise<PhotoRecord | null> {
          return new Promise((res, rej) => {
            const tx = db.transaction('photos', 'readonly')
            tx.onerror = () => rej(tx.error ?? new Error('Ошибка чтения из IndexedDB'))
            const reqGet = tx.objectStore('photos').get(id)
            reqGet.onerror = () => rej(reqGet.error ?? new Error('Ошибка запроса фото'))
            reqGet.onsuccess = () => {
              res((reqGet.result as PhotoRecord) ?? null)
            }
          })
        },

        list(): Promise<PhotoMeta[]> {
          return new Promise((res, rej) => {
            const tx = db.transaction('photos', 'readonly')
            tx.onerror = () => rej(tx.error ?? new Error('Ошибка получения списка из IndexedDB'))
            const reqAll = tx.objectStore('photos').getAll()
            reqAll.onerror = () => rej(reqAll.error ?? new Error('Ошибка запроса списка фото'))
            reqAll.onsuccess = () => {
              const records = (reqAll.result as PhotoRecord[]) || []
              const metas: PhotoMeta[] = records
                .map(({ id, name, width, height, bytes, rights, addedAt }) => ({
                  id,
                  name,
                  width,
                  height,
                  bytes,
                  rights,
                  addedAt
                }))
                .sort((a, b) => a.addedAt.localeCompare(b.addedAt))
              res(metas)
            }
          })
        },

        remove(id: string): Promise<void> {
          return new Promise((res, rej) => {
            const tx = db.transaction('photos', 'readwrite')
            tx.onerror = () => rej(tx.error ?? new Error('Ошибка удаления из IndexedDB'))
            tx.oncomplete = () => res()
            // квота кончилась — транзакция прерывается событием abort, а не error
            tx.onabort = () => rej(tx.error ?? new Error('Запись в IndexedDB прервана: возможно, в браузере нет места'))
            tx.objectStore('photos').delete(id)
          })
        },

        setRights(id: string, rights: boolean): Promise<void> {
          return new Promise((res, rej) => {
            const tx = db.transaction('photos', 'readwrite')
            tx.onerror = () => rej(tx.error ?? new Error('Ошибка обновления прав в IndexedDB'))
            tx.oncomplete = () => res()
            // квота кончилась — транзакция прерывается событием abort, а не error
            tx.onabort = () => rej(tx.error ?? new Error('Запись в IndexedDB прервана: возможно, в браузере нет места'))
            const os = tx.objectStore('photos')
            const reqGet = os.get(id)
            reqGet.onerror = () => rej(reqGet.error ?? new Error('Ошибка поиска фото для обновления прав'))
            reqGet.onsuccess = () => {
              const record = reqGet.result as PhotoRecord | undefined
              if (record) {
                record.rights = rights
                os.put(record)
              }
            }
          })
        }
      }

      resolve(store)
    }
  })
}

// Реализация хранилища в памяти для тестов и запасного варианта
export function memoryPhotoStore(): PhotoStore {
  const records = new Map<string, PhotoRecord>()

  return {
    put(record: PhotoRecord): Promise<void> {
      records.set(record.id, { ...record })
      return Promise.resolve()
    },

    get(id: string): Promise<PhotoRecord | null> {
      const rec = records.get(id)
      return Promise.resolve(rec ? { ...rec } : null)
    },

    list(): Promise<PhotoMeta[]> {
      const metas: PhotoMeta[] = Array.from(records.values())
        .map(({ id, name, width, height, bytes, rights, addedAt }) => ({
          id,
          name,
          width,
          height,
          bytes,
          rights,
          addedAt
        }))
        .sort((a, b) => a.addedAt.localeCompare(b.addedAt))
      return Promise.resolve(metas)
    },

    remove(id: string): Promise<void> {
      records.delete(id)
      return Promise.resolve()
    },

    setRights(id: string, rights: boolean): Promise<void> {
      const rec = records.get(id)
      if (rec) {
        rec.rights = rights
      }
      return Promise.resolve()
    }
  }
}
