import { createHash, timingSafeEqual } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { loadEnv, type ServiceEnv } from './config.js'
import { LlmError, BadRequestError } from './errors.js'

// М-6: ошибка вызывающего (не JSON-парсинг, а форма тела) — своя, узнаваемая run()'ом.
import { generateProse } from './prose.js'
import { classifySkin } from './skin.js'
import { classifyDemand, draftBrief } from './demand.js'

export function createApp(env: ServiceEnv): Hono {
  const app = new Hono()

  // Заслон навешен ГЛОБАЛЬНО, а не поимённо на три известных пути: маршрут, который кто-то
  // добавит потом и забудет подписать на bearer, обязан остаться закрытым, а не утечь наружу.
  // Ошибаться нужно в сторону отказа. /health — единственное явное исключение, разобранное
  // внутри самой мидлвари (см. bearer ниже), а не списком путей снаружи.
  app.use('*', bearer(env))

  app.get('/health', c => c.json({ ok: true }))

  app.post('/prose', run(env, async (body) => generateProse(body, env, env.fetchImpl)))
  app.post('/skin', run(env, async (body) => ({ skin: await classifySkin(body.film, env, env.fetchImpl) })))
  app.post('/demand/classify', run(env, async (body) => {
    // М-6 финального ревью: раньше отсутствие signals роняло classifyDemand на
    // `signals.length` и отдавало 500 internal — «баг сервиса», хотя виноват вызывающий.
    // Механизм 400 уже был (см. bad_request выше для не-JSON тела), просто не применялся сюда.
    if (!Array.isArray(body?.signals)) {
      throw new BadRequestError('signals must be an array')
    }
    return { items: await classifyDemand(body.signals, body.catalog, env, env.fetchImpl) }
  }))
  app.post('/demand/brief', run(env, async (body) =>
    draftBrief(body.topicLabel, body.quotes, body.catalog, env, env.fetchImpl)))

  return app
}

// Постоянное время сравнения токена: сравниваем не сами строки (там length-мисматч и посимвольный
// short-circuit дали бы наблюдателю таймингом раскрыть длину и содержимое), а их sha256-дайджесты
// фиксированной длины через timingSafeEqual. Строго говоря, перед сервисом стоит CF Access и токен
// длинный случайный, так что практическая угроза мала — но сравнение дешёвое, а альтернатива (===)
// обошлась бы дороже при разборе инцидента, чем стоит эта пара строк.
function tokenMatches(got: string, want: string): boolean {
  const a = createHash('sha256').update(got).digest()
  const b = createHash('sha256').update(want).digest()
  return timingSafeEqual(a, b)
}

function bearer(env: ServiceEnv) {
  return async (c: any, next: any) => {
    // /health не требует токена и не ходит в гейтвей — единственное исключение из глобального заслона,
    // и оно живёт здесь, а не списком защищённых путей снаружи (см. комментарий в createApp).
    if (c.req.path === '/health') return next()
    const got = (c.req.header('authorization') || '').replace(/^Bearer\s+/i, '')
    if (!tokenMatches(got, env.API_TOKEN)) return c.json({ error: { code: 'unauthorized', message: 'bad token' } }, 401)
    await next()
  }
}

function run(env: ServiceEnv, fn: (body: any) => Promise<unknown>) {
  return async (c: any) => {
    let body: any
    try { body = await c.req.json() } catch {
      // Не JSON — ошибка вызывающего (400), а не сбой апстрима (502): их нельзя путать.
      return c.json({ error: { code: 'bad_request', message: 'body is not JSON' } }, 400)
    }
    try {
      return c.json(await fn(body) as any)
    } catch (e) {
      if (e instanceof BadRequestError) {
        return c.json({ error: { code: 'bad_request', message: e.message } }, 400)
      }
      if (e instanceof LlmError) {
        // Сбой апстрима (гейтвей/модель) — код и сообщение из контракта gateway.ts, секретов там нет.
        console.error(`[lms-llm] ${e.code}: ${e.message}`)
        return c.json({ error: { code: e.code, message: e.message } }, 502)
      }
      // Посторонняя ошибка — это НАШ баг, а не сбой сети или гейтвея, и код ответа обязан это
      // показывать (502 бы соврал: гейтвей мог быть совершенно здоров). Клиенту — санитизированное
      // тело без подробностей; в лог сервера — настоящая ошибка со стеком, иначе отлаживать нечем.
      const err = e instanceof Error ? e : new Error(String(e))
      console.error(`[lms-llm] internal error: ${err.stack || err.message}`)
      return c.json({ error: { code: 'internal', message: 'internal server error' } }, 500)
    }
  }
}

// import.meta.url всегда file://-URL, а argv[1] на Windows — путь с обратными слэшами и буквой
// диска: сырая конкатенация `file://${argv[1]}` никогда не совпадёт, и npm start молча ничего не
// запустит. pathToFileURL нормализует путь под текущую ОС до сравнения.
const isEntryPoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (process.env.NODE_ENV !== 'test' && isEntryPoint) {
  const env = loadEnv(process.env)
  serve({ fetch: createApp(env).fetch, port: env.PORT, hostname: '0.0.0.0' })
  console.log(`lms-llm listening on :${env.PORT}`)
}
