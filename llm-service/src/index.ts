import { createHash, timingSafeEqual } from 'node:crypto'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { loadEnv, type ServiceEnv } from './config.js'
import { LlmError } from './errors.js'
import { generateProse } from './prose.js'
import { classifySkin } from './skin.js'
import { classifyDemand, draftBrief } from './demand.js'

export function createApp(env: ServiceEnv): Hono {
  const app = new Hono()

  app.get('/health', c => c.json({ ok: true }))

  // Второй слой поверх CF Access: сервис не должен зависеть только от чужого периметра.
  app.use('/prose', bearer(env)); app.use('/skin', bearer(env)); app.use('/demand/*', bearer(env))

  app.post('/prose', run(env, async (body) => generateProse(body, env, env.fetchImpl)))
  app.post('/skin', run(env, async (body) => ({ skin: await classifySkin(body.film, env, env.fetchImpl) })))
  app.post('/demand/classify', run(env, async (body) =>
    ({ items: await classifyDemand(body.signals, body.catalog, env, env.fetchImpl) })))
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
      const code = e instanceof LlmError ? e.code : 'gateway_unreachable'
      const message = e instanceof LlmError ? e.message : 'upstream failure'
      console.error(`[lms-llm] ${code}: ${message}`)   // секретов в message нет по контракту gateway.ts
      return c.json({ error: { code, message } }, 502)
    }
  }
}

if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  const env = loadEnv(process.env)
  serve({ fetch: createApp(env).fetch, port: env.PORT, hostname: '0.0.0.0' })
  console.log(`lms-llm listening on :${env.PORT}`)
}
