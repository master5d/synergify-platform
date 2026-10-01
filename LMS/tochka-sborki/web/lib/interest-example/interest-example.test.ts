import { describe, it, expect, vi } from 'vitest'
import { checkInterestExample } from './guard'
import { interestCacheKey, fnv1a } from './cache-key'
import { interestKey, INTERESTS } from './interests'
import { exampleParagraphs } from './render'
import { loadInterestExample } from './client'
import { CORE_MANIFEST } from '../authoring/manifest'

const SOURCE = 'Команда: `Напиши пост`. Нужен пост на 3 абзаца.\n\nАгенту не надо угадывать.'
const GOOD = 'Команда: `Напиши пост`. Коучу нужен пост для клиентов на 3 абзаца.\n\nАгенту не приходится гадать.'

describe('гвард пересказанного примера', () => {
  it('годный пересказ — 0 находок', () => {
    expect(checkInterestExample(SOURCE, GOOD, CORE_MANIFEST)).toEqual([])
  })
  it('исходник сам себе годен', () => {
    expect(checkInterestExample(SOURCE, SOURCE, CORE_MANIFEST)).toEqual([])
  })
  it('выдуманное число ловится', () => {
    const f = checkInterestExample(SOURCE, GOOD.replace('на 3 абзаца', 'на 3 абзаца, +40% клиентов'), CORE_MANIFEST)
    expect(f.join(' ')).toMatch(/новые числа: 40/)
  })
  it('изменённый инлайн-код ловится', () => {
    expect(checkInterestExample(SOURCE, GOOD.replace('`Напиши пост`', '`Напиши пост коучу`'), CORE_MANIFEST).join(' ')).toMatch(/инлайн-код/)
  })
  it('потерянный абзац ловится', () => {
    expect(checkInterestExample(SOURCE, GOOD.replace('\n\n', ' '), CORE_MANIFEST).join(' ')).toMatch(/абзацев 1/)
  })
  it('слишком короткий / длинный ответ ловится', () => {
    expect(checkInterestExample(SOURCE, 'Коротко.', CORE_MANIFEST).join(' ')).toMatch(/длина/)
    expect(checkInterestExample(SOURCE, GOOD + ' ' + 'слово '.repeat(40), CORE_MANIFEST).join(' ')).toMatch(/длина/)
  })
  it('новая ссылка ловится', () => {
    expect(checkInterestExample(SOURCE, GOOD.replace('гадать.', 'гадать: https://x.io.'), CORE_MANIFEST).join(' ')).toMatch(/ссылки/)
  })
  it('отказ манифеста: обещание результата и scarcity ловятся', () => {
    const f = checkInterestExample(SOURCE, GOOD.replace('Агенту', 'Успей! Гарантированный результат. Агенту'), CORE_MANIFEST)
    expect(f.some(x => x.startsWith('манифест'))).toBe(true)
  })
  it('de-hustle: «пассивный доход» ловится', () => {
    expect(checkInterestExample(SOURCE, GOOD.replace('для клиентов', 'про пассивный доход'), CORE_MANIFEST).join(' ')).toMatch(/de-hustle/)
  })
  it('пустой ответ — находка', () => {
    expect(checkInterestExample(SOURCE, '', CORE_MANIFEST)).toEqual(['пустой пример'])
  })
})

describe('ключ интереса и кэша', () => {
  it('niche → ключ только из закрытого списка', () => {
    expect(interestKey('coach')).toBe('coach')
    expect(interestKey(' Tech ')).toBe('tech')
    expect(interestKey('other')).toBeNull()
    expect(interestKey('йога')).toBeNull()
    expect(interestKey(null)).toBeNull()
    expect(interestKey(undefined)).toBeNull()
    expect(INTERESTS).not.toContain('other')
  })
  const base = { module: '01-introduction', unit: 'u2-four-shifts', id: 'delegation', locale: 'ru' as const, interest: 'coach', source: SOURCE }
  it('детерминирован и несёт все оси пары', () => {
    const k = interestCacheKey(base)!
    expect(k).toBe(interestCacheKey({ ...base })!)
    expect(k).toContain('/v1/01-introduction/u2-four-shifts/delegation/ru/coach/')
    expect(k.startsWith('https://interest-example.cache/')).toBe(true)
  })
  it('правка исходника, другой интерес или локаль — другой ключ', () => {
    const k = interestCacheKey(base)
    expect(interestCacheKey({ ...base, source: SOURCE + '!' })).not.toBe(k)
    expect(interestCacheKey({ ...base, interest: 'tech' })).not.toBe(k)
    expect(interestCacheKey({ ...base, locale: 'en' })).not.toBe(k)
  })
  it('интерес вне списка ключа не даёт — кэш конечен', () => {
    expect(interestCacheKey({ ...base, interest: 'yoga' })).toBeNull()
    expect(interestCacheKey({ ...base, interest: 'other' })).toBeNull()
  })
  it('fnv1a — 8 hex, эталон', () => {
    expect(fnv1a('')).toBe('811c9dc5')
    expect(fnv1a('a')).toBe('e40c292c')
  })
})

describe('рендер текста примера', () => {
  it('абзацы и инлайн-код, без HTML', () => {
    expect(exampleParagraphs('Жми `ls -la` сейчас.\n\n<b>нет</b>')).toEqual([
      [{ code: false, text: 'Жми ' }, { code: true, text: 'ls -la' }, { code: false, text: ' сейчас.' }],
      [{ code: false, text: '<b>нет</b>' }],
    ])
  })
})

describe('клиент концепт-фазы', () => {
  const req = { module: 'm', unit: 'u', id: 'e', locale: 'ru' as const }
  const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body })
  const noSleep = async () => {}

  it('персональный пример, прошедший гвард, — показываем', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok({ source: 'interest', interest: 'coach', text: GOOD }))
    await expect(loadInterestExample(req, SOURCE, CORE_MANIFEST, { fetchImpl: fetchImpl as any })).resolves.toEqual({ interest: 'coach', text: GOOD })
    const init = fetchImpl.mock.calls[0][1]
    expect(init.credentials).toBe('include')
    expect(JSON.parse(init.body)).toEqual(req) // интерес клиент не шлёт — его знает воркер
  })
  it('нет интереса → общий пример', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok({ source: 'template', reason: 'no_interest' }))
    await expect(loadInterestExample(req, SOURCE, CORE_MANIFEST, { fetchImpl: fetchImpl as any })).resolves.toBeNull()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
  it('таймаут / сеть → общий пример', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(Object.assign(new Error('t'), { name: 'TimeoutError' }))
    await expect(loadInterestExample(req, SOURCE, CORE_MANIFEST, { fetchImpl: fetchImpl as any })).resolves.toBeNull()
  })
  it('401 (нет сессии) → общий пример', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) })
    await expect(loadInterestExample(req, SOURCE, CORE_MANIFEST, { fetchImpl: fetchImpl as any })).resolves.toBeNull()
  })
  it('отказ манифеста на клиенте → общий пример', async () => {
    const bad = GOOD.replace('Агенту', 'Успей! Агенту')
    const fetchImpl = vi.fn().mockResolvedValue(ok({ source: 'interest', interest: 'coach', text: bad }))
    await expect(loadInterestExample(req, SOURCE, CORE_MANIFEST, { fetchImpl: fetchImpl as any })).resolves.toBeNull()
  })
  it('интерес вне списка в ответе → общий пример', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok({ source: 'interest', interest: 'yoga', text: GOOD }))
    await expect(loadInterestExample(req, SOURCE, CORE_MANIFEST, { fetchImpl: fetchImpl as any })).resolves.toBeNull()
  })
  it('pending → ровно один повтор', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(ok({ source: 'template', reason: 'pending' }))
      .mockResolvedValueOnce(ok({ source: 'interest', interest: 'tech', text: GOOD }))
    const sleep = vi.fn(noSleep)
    await expect(loadInterestExample(req, SOURCE, CORE_MANIFEST, { fetchImpl: fetchImpl as any, sleep, retryDelayMs: 5 })).resolves.toEqual({ interest: 'tech', text: GOOD })
    expect(sleep).toHaveBeenCalledWith(5)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
  it('pending дважды → общий пример, третьего запроса нет', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok({ source: 'template', reason: 'pending' }))
    await expect(loadInterestExample(req, SOURCE, CORE_MANIFEST, { fetchImpl: fetchImpl as any, sleep: noSleep })).resolves.toBeNull()
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})
