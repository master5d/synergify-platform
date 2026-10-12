// «Сторож» основного сайта (решение владельца 2026-10-11, BACKLOG «Зеркало ts-gitbook: как его найдёт тот,
// кого режут»). Ссылка на зеркало раньше жила только в юните за входом — ученик, которому Cloudflare режут,
// до неё не доходил. Inline-скрипт в <head> стоит в первых килобайтах HTML и выполняется, даже если провайдер
// обрезал страницу на 16 КБ: если за WATCHDOG_MS страница не гидрировалась, внизу появляется ссылка на тот же
// путь в зеркале. Гидрация (components/hydration-mark.tsx) ставит флаг и убирает плашку, если та уже видна —
// медленный, но рабочий интернет лишнего не получает.

export const HYDRATED_FLAG = '__courseHydrated'
export const WATCHDOG_ID = 'mirror-watchdog'
export const WATCHDOG_MS = 10000

/** Сторож нужен только основной сборке и только курсу, у которого есть зеркало. */
export function watchdogEnabled(isMirror: boolean, mirrorUrl: string | null): boolean {
  return !isMirror && Boolean(mirrorUrl)
}

/** Inline-скрипт сторожа: чистый ES5 и DOM, без зависимостей — бандл может и не доехать. */
export function mirrorWatchdogScript(mirrorUrl: string, delayMs: number = WATCHDOG_MS): string {
  const m = JSON.stringify(mirrorUrl.replace(/\/$/, ''))
  const flag = JSON.stringify(HYDRATED_FLAG)
  const id = JSON.stringify(WATCHDOG_ID)
  return `(function(){try{var M=${m},F=${flag},I=${id};` +
    `setTimeout(function(){try{if(window[F]||document.getElementById(I))return;` +
    `var en=/^\\/en(\\/|$)/.test(location.pathname);` +
    `var d=document.createElement('div');d.id=I;d.setAttribute('role','alert');` +
    `d.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147483647;padding:12px 16px;background:#111;color:#fff;font:15px/1.4 system-ui,sans-serif;text-align:center';` +
    `d.appendChild(document.createTextNode(en?'The course is taking long to load. ':'Курс долго грузится. '));` +
    `var a=document.createElement('a');a.href=M+location.pathname+location.search;a.style.cssText='color:#7dd3fc';` +
    `a.textContent=en?'Open the read-only mirror':'Открыть зеркало для чтения';d.appendChild(a);` +
    `var b=document.createElement('button');b.type='button';b.textContent='\\u00d7';b.setAttribute('aria-label',en?'Close':'Закрыть');` +
    `b.style.cssText='margin-left:12px;background:none;border:0;color:#fff;font-size:18px;cursor:pointer';` +
    `b.onclick=function(){if(d.parentNode)d.parentNode.removeChild(d)};d.appendChild(b);` +
    `(document.body||document.documentElement).appendChild(d);}catch(e){}},${Math.max(0, Math.floor(delayMs))});` +
    `}catch(e){}})();`
}

type WatchdogWindow = Record<string, unknown>
type WatchdogDocument = { getElementById(id: string): { parentNode: { removeChild(c: unknown): unknown } | null } | null }

/** Гидрация состоялась: сторожу молчать, а уже показанную плашку убрать. */
export function markHydrated(win: WatchdogWindow, doc: WatchdogDocument): void {
  win[HYDRATED_FLAG] = 1
  const banner = doc.getElementById(WATCHDOG_ID)
  if (banner && banner.parentNode) banner.parentNode.removeChild(banner)
}
