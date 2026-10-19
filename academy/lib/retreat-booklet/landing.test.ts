import { describe, expect, it } from 'vitest'
import { decodeToolLink } from '../retreat-core/tool-link'
import { bookletHash, defaultForm, defaultLanding, draftOf, exportJson, formFromDecoded, formFromDraft, importJson, pickBookletTool } from './form'
import { SECTION_IDS } from './sections'
import { checkLanding, LANDING_ORDER, renderLandingHtml } from './landing'
import { issueText } from './labels'

const today = '2027-01-01' as const
const PH = 'ph-abcdefghijkl'
const media = (rights: Record<string, boolean> = { [PH]: true }) => ({ photoUris: { [PH]: 'data:image/png;base64,AA==' }, rights })
const ids = (r: { errors: { id: string }[]; warnings: { id: string }[] }) => [...r.errors, ...r.warnings].map((x) => x.id)

function filled() {
  const f = defaultForm(today, 'ru')
  f.passport = { title: 'Нейтральный ретрит', start: '2027-09-13', nights: 3, currency: 'USD' }
  Object.assign(f.content, {
    place: 'Площадка', invitation: 'Приглашение', fitFor: ['Гости'], notFor: ['Не сейчас'], experiences: [{ text: 'Практика', serves: 'Фокус' }],
    days: ['Первый день'], leaders: [{ name: 'Ведущий', role: 'Роль', bio: 'Опыт' }], team: [{ name: 'Помощник', role: 'Помощь', bio: 'Опыт' }],
    placeText: 'Место', foodText: 'Еда', included: ['Материалы'], notIncluded: ['Дорога'], bookingSteps: ['Шаг'], preparation: 'Подготовка',
    packing: ['Вещи'], travel: { startTime: '10:00', endTime: '12:00', airport: 'Станция', travelTime: '1 час', notes: 'Заметка' }, rules: ['Правило'],
    paymentsText: 'Оплата', testimonials: [{ quote: 'Хорошо', author: 'Автор', consent: true }], faq: [{ q: 'Вопрос', a: 'Ответ' }],
    contact: 'contact@example.test',
  })
  f.enabled = [...SECTION_IDS]
  f.landing.cta = { label: 'Записаться', url: 'https://example.test/apply' }
  f.landing.subtitle = 'Неделя тишины'
  f.landing.priceNote = 'До 1 марта — ранняя цена'
  f.imports.calc = { at: today, data: { v: 1, price: 1200, currency: 'USD', accommodation: [
    { name: 'Своя комната', guests: 2, surcharge: 300, cost: 100 }, { name: 'Домик', guests: 1, surcharge: 500, cost: 200 }] } }
  return f
}
const render = (f = filled(), m = media()) => renderLandingHtml(f, 'ru', today, m)

describe('landing', () => {
  it('L01 старая ссылка без landing читается с defaultLanding', () => {
    expect(pickBookletTool({ content: { language: 'ru' } }).landing).toEqual(defaultLanding('ru'))
    expect(defaultLanding('ru').cta.label).toBe('Записаться')
    expect(defaultLanding('en').cta.label).toBe('Apply')
    expect(defaultLanding('ru').footer).toBe(true)
  })
  it('L02 landing переживает bookletHash и JSON (toEqual)', () => {
    const f = filled(); f.landing.numbers = [{ value: '3', label: 'ночи' }]; f.landing.videoUrl = 'https://youtu.be/dQw4w9WgXcQ'
    expect(formFromDecoded(decodeToolLink(bookletHash(f), pickBookletTool, 'ru'), today, 'ru')).toEqual(f)
    expect(importJson(exportJson(f), today, 'ru')).toEqual(f)
    expect(formFromDraft(draftOf(f), today, 'ru')?.landing).toEqual(f.landing)
  })
  it('L03 pickBookletTool режет поля landing по лимитам и чисел не больше 4', () => {
    const f = pickBookletTool({ landing: { subtitle: 'a'.repeat(300), cta: { label: 'b'.repeat(80), url: 'c'.repeat(700) },
      numbers: Array(9).fill({ value: 'v'.repeat(30), label: 'l'.repeat(80) }), videoUrl: 'x'.repeat(700), priceNote: 'p'.repeat(300) } })
    expect(f.landing.subtitle).toHaveLength(200)
    expect(f.landing.cta.label).toHaveLength(40)
    expect(f.landing.cta.url).toHaveLength(500)
    expect(f.landing.numbers).toHaveLength(4)
    expect(f.landing.numbers[0].value).toHaveLength(20)
    expect(f.landing.numbers[0].label).toHaveLength(60)
    expect(f.landing.videoUrl).toHaveLength(500)
    expect(f.landing.priceNote).toHaveLength(200)
  })
  it('L04 cta-missing при пустом адресе', () => {
    expect(checkLanding(defaultForm(today, 'ru'), 'ru', today).errors.map((x) => x.id)).toContain('cta-missing')
  })
  it('L05 cta-invalid для javascript: и http://', () => {
    for (const url of ['javascript:alert(1)', 'http://example.test']) {
      const f = defaultForm(today, 'ru'); f.landing.cta.url = url
      expect(checkLanding(f, 'ru', today).errors.map((x) => x.id), url).toContain('cta-invalid')
    }
  })
  it('L06 нет cta-ошибок для https и mailto', () => {
    for (const url of ['https://example.test/apply', 'mailto:apply@example.test']) {
      const f = defaultForm(today, 'ru'); f.landing.cta.url = url
      const found = checkLanding(f, 'ru', today).errors.map((x) => x.id)
      expect(found, url).not.toContain('cta-invalid')
      expect(found, url).not.toContain('cta-missing')
    }
  })
  it('L07 video-not-allowed для чужого видео', () => {
    const f = filled(); f.landing.videoUrl = 'https://video.example.test/watch/abc'
    expect(ids(checkLanding(f, 'ru', today))).toContain('video-not-allowed')
    f.landing.videoUrl = 'https://youtu.be/dQw4w9WgXcQ'
    expect(ids(checkLanding(f, 'ru', today))).not.toContain('video-not-allowed')
  })
  it('L08 file-heavy при htmlSize больше предела', () => {
    expect(ids(checkLanding(filled(), 'ru', today, {}, 8_000_001))).toContain('file-heavy')
    expect(ids(checkLanding(filled(), 'ru', today, {}, 7_999_999))).not.toContain('file-heavy')
  })
  it('L09 тексты новых проверок есть RU и EN', () => {
    for (const id of ['cta-missing', 'cta-invalid', 'video-not-allowed', 'file-heavy']) {
      for (const lang of ['ru', 'en'] as const) {
        const text = issueText({ id }, lang)
        expect(text.length, `${id} ${lang}`).toBeGreaterThan(20)
        expect(text, `${id} ${lang}`).not.toContain(id)
      }
    }
  })
  it('L10 рендер — полный документ с viewport, title и description', () => {
    const html = render()
    expect(html.startsWith('<!doctype html><html lang="ru">')).toBe(true)
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">')
    expect(html).toContain('<title>Нейтральный ретрит</title>')
    expect(html).toContain('<meta name="description" content="Неделя тишины">')
    expect(html).toContain('<meta property="og:title" content="Нейтральный ретрит">')
  })
  it('L11 в рендере нет script и внешних ресурсов кроме iframe видео', () => {
    const f = filled(); f.landing.videoUrl = 'https://youtu.be/dQw4w9WgXcQ'
    const html = render(f)
    expect(html).not.toMatch(/<script|<link\s/i)
    expect(html).not.toMatch(/<img[^>]+src="https?:/i)
    expect(html.match(/<style>/g)).toHaveLength(1)
    expect(html.match(/src="https?:[^"]*"/g)).toEqual(['src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"'])
  })
  it('L12 текст с <script> экранирован', () => {
    const f = filled(); f.content.invitation = '<script>alert(1)</script>'; f.content.place = 'Дом "Сосны" и \'Ели\''
    const html = render(f)
    expect(html).not.toContain('<script>alert')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('Дом &quot;Сосны&quot; и &#39;Ели&#39;')
  })
  it('L13 кнопка ведёт на cta.url и повторяется не меньше трёх раз', () => {
    const html = render()
    expect(html.match(/<a class="button" href="https:\/\/example\.test\/apply" rel="noopener">Записаться<\/a>/g)?.length ?? 0).toBeGreaterThanOrEqual(3)
    expect(html.indexOf('<header>')).toBeLessThan(html.indexOf('class="button"'))
  })
  it('L14 кнопки нет, если адрес не прошёл ctaUrlOk', () => {
    const f = filled(); f.landing.cta.url = 'javascript:bad'
    const html = render(f)
    expect(html).not.toContain('javascript:bad')
    expect(html).not.toContain('class="button"')
  })
  it('L15 фото без права не попадает в HTML, с правом — data URI на месте', () => {
    const f = filled(); f.content.coverPhotoId = PH; f.content.leaders[0].photoId = PH
    expect(render(f).match(/data:image\/png/g)?.length).toBe(3)
    expect(render(f, media({}))).not.toContain('data:image/png')
    const leaderOnly = filled(); leaderOnly.content.leaders[0].photoId = PH
    expect(render(leaderOnly, media({}))).not.toContain('data:image/png')
  })
  it('L16 og:image только у обложки с правом', () => {
    const f = filled(); f.content.coverPhotoId = PH
    expect(render(f)).toContain('<meta property="og:image" content="data:image/png;base64,AA==">')
    expect(render(f, media({}))).not.toContain('og:image')
  })
  it('L17 выключенный раздел не попадает, порядок секций по spec', () => {
    const f = filled(); f.enabled = SECTION_IDS.filter((x) => x !== 'food')
    const html = render(f)
    expect(html).not.toContain('id="food"')
    expect(html).not.toContain('href="#food"')
    const order = [...html.matchAll(/<section id="([a-z]+)"/g)].map((m) => m[1]).filter((id) => (LANDING_ORDER as string[]).includes(id))
    // без импорта программы расписание пусто и честно не рисуется
    expect(order).toEqual(LANDING_ORDER.filter((id) => id !== 'food' && id !== 'schedule'))
    expect(html.indexOf('id="booking"')).toBeLessThan(html.indexOf('id="payments"'))
    expect(html.indexOf('id="payments"')).toBeLessThan(html.indexOf('id="preparation"'))
  })
  it('L18 тарифы: цена участия и каждая опция проживания — отдельные карточки', () => {
    const html = render()
    const pricing = html.split('<section id="pricing">')[1].split('</section>')[0]
    expect(pricing.match(/<article class="card">/g)).toHaveLength(3)
    expect(pricing.match(/class="button"/g)).toHaveLength(3)
    expect(pricing).toContain('Своя комната')
    expect(pricing).toContain('Домик')
    expect(pricing).toContain('До 1 марта — ранняя цена')
  })
  it('L19 видео YouTube встраивается через youtube-nocookie', () => {
    const f = filled(); f.landing.videoUrl = 'https://youtu.be/dQw4w9WgXcQ'
    const html = render(f)
    expect(html).toContain('<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"')
    expect(html).toContain('loading="lazy" allowfullscreen')
    expect(html.indexOf('id="experiences"')).toBeLessThan(html.indexOf('id="video"'))
  })
  it('L20 якорная навигация ведёт на id включённых секций', () => {
    const html = render()
    const nav = html.split('<nav>')[1].split('</nav>')[0]
    const targets = [...nav.matchAll(/href="#([a-z]+)"/g)].map((m) => m[1])
    expect(targets).toEqual(LANDING_ORDER.filter((id) => id !== 'schedule'))
    for (const id of targets) expect(html, id).toContain(`<section id="${id}">`)
  })
  it('L21 отзыв без согласия не печатается', () => {
    const f = filled(); f.content.testimonials = [{ quote: 'Скрытый отзыв', author: 'Автор', consent: false }, { quote: 'Открытый', author: 'Б', consent: true }]
    const html = render(f)
    expect(html).not.toContain('Скрытый отзыв')
    expect(html).toContain('Открытый')
  })
  it('L22 подвал выключается флагом footer', () => {
    expect(render()).toContain('<footer>Страница собрана в академии S.A.S.H.A.</footer>')
    const f = filled(); f.landing.footer = false
    expect(render(f)).not.toContain('<footer>')
  })
  it('L23 в расписании нет служебных строк нагрузки и свободного времени', () => {
    const f = filled()
    f.imports.program = { at: today, retreat: f.passport, cards: [],
      blocks: [{ day: 1, start: '09:00', minutes: 60, kind: 'other', title: 'Утренний круг' }] }
    const table = render(f).split('<section id="schedule">')[1].split('</section>')[0]
    expect(table).toContain('<td>09:00</td><td>Утренний круг</td>')
    expect(table).not.toMatch(/Нагрузка|Свободное время/)
  })
  it('L24 карточка без фото не держит колонку под фото', () => {
    const f = filled(); f.content.leaders[0].photoId = PH
    const html = render(f)
    expect(html).toContain('<article class="person"><img')
    expect(html).toContain('<article class="person solo">')
    expect(html).toContain('.person.solo{grid-template-columns:1fr}')
  })
  it('L25 пустой список «не включено» не оставляет голый заголовок', () => {
    const f = filled(); f.content.notIncluded = []
    const html = render(f)
    expect(html).toContain('<h3>Включено</h3>')
    expect(html).not.toContain('<h3>Не включено</h3>')
    expect(render()).toContain('<h3>Не включено</h3>')
  })
})
