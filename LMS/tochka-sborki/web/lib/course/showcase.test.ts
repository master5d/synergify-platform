import { describe, it, expect } from 'vitest'
import { getShowcase, videoEmbedUrl, resolveVideoSource, withAutoplay, filterByCategory, CATEGORY_KEYS, deepDiveUrl } from './showcase'
import { lintDehustle } from '@/lib/authoring/dehustle'

describe('getShowcase', () => {
  for (const loc of ['ru', 'en'] as const) {
    it(`label/cta + >=4 dream cases with content (${loc})`, () => {
      const s = getShowcase(loc)
      expect(s.label.length).toBeGreaterThan(0)
      expect(s.cta.length).toBeGreaterThan(0)
      expect(s.dream.heading.length).toBeGreaterThan(0)
      expect(s.dream.cases.length).toBeGreaterThanOrEqual(4)
      for (const c of s.dream.cases) {
        expect(c.title.length).toBeGreaterThan(0)
        expect(c.blurb.length).toBeGreaterThan(0)
        expect(c.tag.length).toBeGreaterThan(0)
        expect(c.icon.length).toBeGreaterThan(0)
      }
    })
    it(`>=1 real case with proof fields (${loc})`, () => {
      const s = getShowcase(loc)
      expect(s.real.heading.length).toBeGreaterThan(0)
      expect(s.real.cases.length).toBeGreaterThanOrEqual(1)
      for (const c of s.real.cases) {
        expect(c.title.length).toBeGreaterThan(0)
        expect(c.blurb.length).toBeGreaterThan(0)
        expect(c.tag.length).toBeGreaterThan(0)
        expect(c.icon.length).toBeGreaterThan(0)
        expect(c.result.length).toBeGreaterThan(0)
        expect(c.author.length).toBeGreaterThan(0)
      }
    })
  }
  it('ru and en differ', () => {
    expect(getShowcase('ru').dream.heading).not.toBe(getShowcase('en').dream.heading)
    expect(getShowcase('ru').real.heading).not.toBe(getShowcase('en').real.heading)
  })
  it('video source is null until a URL is configured', () => {
    expect(getShowcase('ru').video.source).toBeNull()
  })
})

describe('videoEmbedUrl', () => {
  it('null passthrough', () => expect(videoEmbedUrl(null)).toBeNull())
  it('youtu.be → nocookie embed', () => expect(videoEmbedUrl('https://youtu.be/abc123')).toBe('https://www.youtube-nocookie.com/embed/abc123'))
  it('youtube watch → embed', () => expect(videoEmbedUrl('https://www.youtube.com/watch?v=XYZ_1')).toBe('https://www.youtube-nocookie.com/embed/XYZ_1'))
  it('vimeo → player', () => expect(videoEmbedUrl('https://vimeo.com/12345')).toBe('https://player.vimeo.com/video/12345'))
  it('unknown URL passthrough', () => expect(videoEmbedUrl('https://example.com/v.mp4')).toBe('https://example.com/v.mp4'))
})

describe('resolveVideoSource', () => {
  it('null → null', () => expect(resolveVideoSource(null)).toBeNull())
  it('.mp4 → file', () => expect(resolveVideoSource('https://x.com/v.mp4')).toEqual({ kind: 'file', src: 'https://x.com/v.mp4' }))
  it('.webm → file', () => expect(resolveVideoSource('https://x.com/v.webm')).toEqual({ kind: 'file', src: 'https://x.com/v.webm' }))
  it('.mp4 with query → file', () => expect(resolveVideoSource('https://x.com/v.mp4?t=1')).toEqual({ kind: 'file', src: 'https://x.com/v.mp4?t=1' }))
  it('youtu.be → embed (nocookie)', () => expect(resolveVideoSource('https://youtu.be/abc123')).toEqual({ kind: 'embed', src: 'https://www.youtube-nocookie.com/embed/abc123' }))
  it('vimeo → embed (player)', () => expect(resolveVideoSource('https://vimeo.com/12345')).toEqual({ kind: 'embed', src: 'https://player.vimeo.com/video/12345' }))
})

describe('withAutoplay', () => {
  it('no query → appends ?autoplay=1', () => expect(withAutoplay('https://www.youtube-nocookie.com/embed/ID')).toBe('https://www.youtube-nocookie.com/embed/ID?autoplay=1'))
  it('existing query → appends &autoplay=1', () => expect(withAutoplay('https://player.vimeo.com/video/1?h=x')).toBe('https://player.vimeo.com/video/1?h=x&autoplay=1'))
})

describe('categories', () => {
  it('every real+dream case has a valid category key', () => {
    const s = getShowcase('ru')
    for (const c of [...s.real.cases, ...s.dream.cases]) {
      expect(CATEGORY_KEYS).toContain(c.category)
    }
  })

  for (const loc of ['ru', 'en'] as const) {
    it(`categories = used keys in registry order, non-empty, labelled, each >=1 case (${loc})`, () => {
      const s = getShowcase(loc)
      expect(s.categories.length).toBeGreaterThan(0)
      const all = [...s.real.cases, ...s.dream.cases]
      const used = new Set(all.map(c => c.category))
      // exactly the used keys
      expect(new Set(s.categories.map(c => c.key))).toEqual(used)
      // registry order
      expect(s.categories.map(c => c.key)).toEqual(CATEGORY_KEYS.filter(k => used.has(k)))
      // each labelled + maps to >=1 case (no empty tabs)
      for (const cat of s.categories) {
        expect(cat.label.length).toBeGreaterThan(0)
        expect(all.filter(c => c.category === cat.key).length).toBeGreaterThanOrEqual(1)
      }
    })
  }

  it('ru and en category labels differ (bilingual)', () => {
    const ru = getShowcase('ru').categories.map(c => c.label).join('|')
    const en = getShowcase('en').categories.map(c => c.label).join('|')
    expect(ru).not.toBe(en)
  })
})

describe('filterByCategory', () => {
  const sample = [
    { category: 'launch' as const, id: 'a' },
    { category: 'flow' as const, id: 'b' },
    { category: 'launch' as const, id: 'c' },
  ]
  it('all → full list unchanged', () => expect(filterByCategory(sample, 'all')).toEqual(sample))
  it('key → only that category', () => expect(filterByCategory(sample, 'launch').map(x => x.id)).toEqual(['a', 'c']))
  it('unused key → empty', () => expect(filterByCategory(sample, 'knowledge')).toEqual([]))
})

describe('possibility-menu (dream cases)', () => {
  const dream = getShowcase('ru').dream.cases
  const dreamEn = getShowcase('en').dream.cases

  it('is an expanded curated menu (>=10) covering all categories', () => {
    expect(dream.length).toBeGreaterThanOrEqual(10)
    expect(new Set(dream.map(c => c.category))).toEqual(new Set(CATEGORY_KEYS))
  })

  it('every dream case is bilingual non-empty', () => {
    for (const arr of [dream, dreamEn]) for (const c of arr) {
      expect(c.title.trim().length).toBeGreaterThan(0)
      expect(c.blurb.trim().length).toBeGreaterThan(0)
      expect(c.tag.trim().length).toBeGreaterThan(0)
    }
  })

  it('is de-hustled — no money-promise framing', () => {
    const banned = /(зараб|доход|деньг|прибыл|earn|income|\bmoney\b|profit|passive)/i
    for (const arr of [dream, dreamEn]) for (const c of arr) {
      expect(banned.test(c.title), `money framing in title: ${c.title}`).toBe(false)
      expect(banned.test(c.blurb), `money framing in blurb: ${c.blurb}`).toBe(false)
    }
  })

  it('dream case ids are unique', () => {
    const ids = dream.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('showcase deep-dive wiring', () => {
  const CONTRACT_SLUGS = ['echo', 'diagram-canvas', 'the-site-itself', 'second-brain']

  it('deepDiveUrl builds canonical ru/en blog URLs', () => {
    expect(deepDiveUrl('echo', 'ru')).toBe('https://mamaev.coach/blog/echo/')
    expect(deepDiveUrl('echo', 'en')).toBe('https://mamaev.coach/en/blog/echo/')
  })

  it('every real case links to a contract deep-dive (ru)', () => {
    const cases = getShowcase('ru').real.cases
    expect(cases.length).toBeGreaterThanOrEqual(4)
    for (const c of cases) {
      expect(c.href, c.id).toBeTruthy()
      const m = c.href!.match(/^https:\/\/mamaev\.coach\/blog\/([a-z-]+)\/$/)
      expect(m, c.href).toBeTruthy()
      expect(CONTRACT_SLUGS, c.id).toContain(m![1])
    }
  })

  it('en real cases use the /en/blog/ prefix', () => {
    for (const c of getShowcase('en').real.cases) {
      expect(c.href!).toMatch(/^https:\/\/mamaev\.coach\/en\/blog\/[a-z-]+\/$/)
    }
  })
})

describe('for-good dream cases (fb_650d16d2)', () => {
  for (const loc of ['ru', 'en'] as const) {
    it(`for-good tab appears in categories (${loc})`, () => {
      const s = getShowcase(loc)
      expect(s.categories.some(c => c.key === 'for-good')).toBe(true)
    })
    it(`>=4 for-good dream cases, fully populated (${loc})`, () => {
      const s = getShowcase(loc)
      const fg = s.dream.cases.filter(c => c.category === 'for-good')
      expect(fg.length).toBeGreaterThanOrEqual(4)
      for (const c of fg) {
        expect(c.title.length).toBeGreaterThan(0)
        expect(c.blurb.length).toBeGreaterThan(0)
        expect(c.tag.length).toBeGreaterThan(0)
        expect(c.icon.length).toBeGreaterThan(0)
      }
    })
    it(`ALL showcase copy is de-hustle clean (${loc})`, () => {
      const s = getShowcase(loc)
      const strings = [
        ...s.dream.cases.flatMap(c => [c.title, c.blurb, c.tag]),
        ...s.real.cases.flatMap(c => [c.title, c.blurb, c.tag, c.result]),
        ...s.others.cases.flatMap(c => [c.title, c.blurb, c.source]),
        s.others.note,
      ]
      for (const str of strings) expect(lintDehustle(str)).toEqual([])
    })
  }
  // Чужая работа отделена от историй учеников. Секция «что делают другие» появилась,
  // чтобы показать соседний ландшафт, и ровно этим она опасна: стоит одному чужому
  // проекту утечь в real.cases с подписью «— Александр», и витрина начнёт врать.
  describe('чужие проекты не выдаются за свои', () => {
    for (const loc of ['ru', 'en'] as const) {
      it(`каждый чужой кейс ведёт наружу и назван по автору (${loc})`, () => {
        const o = getShowcase(loc).others
        expect(o.cases.length).toBeGreaterThan(0)
        expect(o.heading.length).toBeGreaterThan(0)
        expect(o.note.length).toBeGreaterThan(0)
        for (const c of o.cases) {
          expect(c.href).toMatch(/^https:\/\/github\.com\//)
          expect(c.source).toMatch(/awesome-(llm|ai)-apps/)
          expect(c.source).toMatch(/MIT|Apache-2\.0/)
          expect(c.title.length).toBeGreaterThan(0)
          expect(c.blurb.length).toBeGreaterThan(0)
        }
      })
      it(`ни один чужой id не попал в реальные истории (${loc})`, () => {
        const s = getShowcase(loc)
        const realIds = new Set(s.real.cases.map(c => c.id))
        for (const c of s.others.cases) expect(realIds.has(c.id)).toBe(false)
      })
      it(`реальные истории по-прежнему подписаны автором (${loc})`, () => {
        for (const c of getShowcase(loc).real.cases) expect(c.author.length).toBeGreaterThan(0)
      })
    }
  })
  it('for-good ids are the 4 canonical ones', () => {
    const ids = getShowcase('ru').dream.cases.filter(c => c.category === 'for-good').map(c => c.id)
    expect(ids).toEqual(['eco', 'rescue', 'pattern-shield', 'safe-path'])
  })
})
