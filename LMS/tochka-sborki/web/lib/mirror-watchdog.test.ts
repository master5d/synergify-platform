// «Сторож» основного сайта: если страница не гидрировалась, через WATCHDOG_MS — ссылка на зеркало.
// Скрипт исполняется на поддельных window/document/таймерах (среда vitest — node, без DOM).
import { describe, it, expect } from 'vitest'
import { HYDRATED_FLAG, WATCHDOG_ID, WATCHDOG_MS, markHydrated, mirrorWatchdogScript, watchdogEnabled } from './mirror-watchdog'

type El = {
  tag: string; id: string; text: string; href: string; children: El[]; attrs: Record<string, string>
  style: { cssText: string }; onclick: null | (() => void); parentNode: El | null
  appendChild(c: El): El; removeChild(c: El): El; setAttribute(k: string, v: string): void
}

function el(tag: string): El {
  const node: El = {
    tag, id: '', text: '', href: '', children: [], attrs: {}, style: { cssText: '' }, onclick: null, parentNode: null,
    appendChild(c) { c.parentNode = node; node.children.push(c); return c },
    removeChild(c) { node.children = node.children.filter((x) => x !== c); c.parentNode = null; return c },
    setAttribute(k, v) { node.attrs[k] = v },
  }
  Object.defineProperty(node, 'textContent', { set(v: string) { node.text = v }, get() { return node.text } })
  return node
}

function fakeEnv(pathname: string) {
  const body = el('body')
  const timers: (() => void)[] = []
  const win: Record<string, unknown> = {}
  const doc = {
    body,
    documentElement: el('html'),
    createElement: (tag: string) => el(tag),
    createTextNode: (text: string) => ({ ...el('#text'), text }),
    getElementById: (id: string) => {
      const walk = (n: El): El | null => (n.id === id ? n : n.children.map(walk).find(Boolean) ?? null)
      return walk(body)
    },
  }
  const run = (script: string) =>
    new Function('window', 'document', 'location', 'setTimeout', script)(
      win, doc, { pathname, search: '?x=1' }, (fn: () => void) => { timers.push(fn) })
  const fire = () => timers.splice(0).forEach((fn) => fn())
  const banner = () => doc.getElementById(WATCHDOG_ID)
  return { win, doc, run, fire, banner }
}

const linkOf = (b: El) => b.children.find((c) => c.tag === 'a')!

describe('mirrorWatchdogScript', () => {
  it('гидрации нет → плашка со ссылкой на тот же путь зеркала', () => {
    const env = fakeEnv('/lessons/01-introduction/u1-activation/')
    env.run(mirrorWatchdogScript('https://master5d.github.io/ts-gitbook'))
    expect(env.banner()).toBeNull()
    env.fire()
    const b = env.banner()!
    expect(b).not.toBeNull()
    expect(linkOf(b).href).toBe('https://master5d.github.io/ts-gitbook/lessons/01-introduction/u1-activation/?x=1')
    expect(linkOf(b).text).toBe('Открыть зеркало для чтения')
  })
  it('английская страница — английский текст', () => {
    const env = fakeEnv('/en/cheatsheet/')
    env.run(mirrorWatchdogScript('https://master5d.github.io/ts-gitbook'))
    env.fire()
    expect(linkOf(env.banner()!).text).toBe('Open the read-only mirror')
  })
  it('гидрация до таймаута → плашки нет', () => {
    const env = fakeEnv('/')
    env.run(mirrorWatchdogScript('https://master5d.github.io/ts-gitbook'))
    env.win[HYDRATED_FLAG] = 1
    env.fire()
    expect(env.banner()).toBeNull()
  })
  it('гидрация после плашки → плашка убрана', () => {
    const env = fakeEnv('/roadmap/')
    env.run(mirrorWatchdogScript('https://master5d.github.io/ts-gitbook'))
    env.fire()
    expect(env.banner()).not.toBeNull()
    markHydrated(env.win, env.doc)
    expect(env.banner()).toBeNull()
    expect(env.win[HYDRATED_FLAG]).toBe(1)
  })
  it('кнопка «Закрыть» убирает плашку', () => {
    const env = fakeEnv('/')
    env.run(mirrorWatchdogScript('https://master5d.github.io/ts-gitbook'))
    env.fire()
    const close = env.banner()!.children.find((c) => c.tag === 'button')!
    close.onclick!()
    expect(env.banner()).toBeNull()
  })
  it('таймаут по умолчанию — 10 секунд, задержка инлайнится', () => {
    expect(WATCHDOG_MS).toBe(10000)
    expect(mirrorWatchdogScript('https://m.example/x', 4321)).toContain('4321')
  })
})

describe('watchdogEnabled', () => {
  it('только основная сборка и только если у курса есть зеркало', () => {
    expect(watchdogEnabled(false, 'https://master5d.github.io/ts-gitbook')).toBe(true)
    expect(watchdogEnabled(true, 'https://master5d.github.io/ts-gitbook')).toBe(false)
    expect(watchdogEnabled(false, null)).toBe(false)
  })
})
