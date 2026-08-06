import type { Env } from './lib/types'
import { handleFeedback } from './handlers/feedback'
import { handleSendLink, handleVerify, handleMe, handleLogout } from './handlers/auth'
import { handleTelegramAuth } from './handlers/telegram-auth'
import { handleOAuthStart, handleOAuthCallback } from './handlers/oauth'
import { handleTelegramWebhook } from './handlers/telegram-webhook'
import { runDailyNudge } from './handlers/nudge-cron'
import { handleSupportCheckout, handleProductCheckout } from './handlers/checkout'
import { handleStripeWebhook } from './handlers/stripe-webhook'
import { handleView, handleComplete, handleList } from './handlers/progress'
import { handleMe as handleIntakeMe, handleProgress as handleIntakeProgress, handleSubmit as handleIntakeSubmit } from './handlers/intake'
import { runDemandRadar, listBriefs, listSignals, decideBrief } from './handlers/demand'
import { listLeads, syncContacts } from './handlers/leads'
import { getStats } from './handlers/stats'
import { handleLeadCapture } from './handlers/leads-capture'
import { handleAlumniList, handleAlumniMe, handleAlumniOptin } from './handlers/alumni'
import { handleAdmission, handleAcademyMe } from './handlers/academy'
import { requireAuth, requireOwner } from './middleware'

const ALLOWED_ORIGINS = [
  'https://ai.mamaev.coach',
  'https://mamaev.coach',
  'https://mentor.mamaev.coach',
  'https://ai.synergify.com',
  'https://synergify.com',
  'https://academy.synergify.com'
]

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin')
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin || '') ? origin! : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = getCorsHeaders(request)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    try {
      const url = new URL(request.url)
      const path = url.pathname
      const method = request.method

      let response: Response

      if (path === '/api/feedback' && method === 'POST') {
        response = await handleFeedback(request, env)
      } else if (path === '/api/leads/capture' && method === 'POST') {
        response = await handleLeadCapture(request, env, ctx)
      } else if (path === '/api/auth/send-link' && method === 'POST') {
        response = await handleSendLink(request, env, ctx)
      } else if (path === '/api/auth/verify' && method === 'POST') {
        response = await handleVerify(request, env)
      } else if (path === '/api/auth/telegram' && method === 'POST') {
        response = await handleTelegramAuth(request, env)
      } else if (path === '/api/auth/oauth/google/start' && method === 'GET') {
        response = await handleOAuthStart(request, env)
      } else if (path === '/api/auth/oauth/google/callback' && method === 'GET') {
        response = await handleOAuthCallback(request, env)
      } else if (path === '/api/telegram/webhook' && method === 'POST') {
        response = await handleTelegramWebhook(request, env)
      } else if (path === '/api/checkout/support' && method === 'POST') {
        response = await handleSupportCheckout(request, env)
      } else if (path === '/api/checkout/product' && method === 'POST') {
        response = await handleProductCheckout(request, env)
      } else if (path === '/api/stripe/webhook' && method === 'POST') {
        response = await handleStripeWebhook(request, env)
      } else if (path === '/api/auth/me' && method === 'GET') {
        response = await handleMe(request, env)
      } else if (path === '/api/auth/logout' && method === 'POST') {
        response = await handleLogout(request, env)
      } else if (path === '/api/progress/view' && method === 'POST') {
        response = await handleView(request, env)
      } else if (path === '/api/progress/complete' && method === 'POST') {
        response = await handleComplete(request, env)
      } else if (path === '/api/progress/list' && method === 'GET') {
        response = await handleList(request, env)
      } else if (path === '/api/intake/me' && method === 'GET') {
        const auth = await requireAuth(request, env)
        response = auth instanceof Response ? auth : await handleIntakeMe(env.DB, auth.sub)
      } else if (path === '/api/intake/progress' && method === 'PATCH') {
        const auth = await requireAuth(request, env)
        if (auth instanceof Response) {
          response = auth
        } else {
          let body: { answers?: any; currentStep?: number; instrumentVersion?: number }
          try { body = await request.json() } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }) }
          response = await handleIntakeProgress(env.DB, auth.sub, { answers: body.answers ?? {}, currentStep: body.currentStep ?? 0, instrumentVersion: body.instrumentVersion === 2 ? 2 : 1 })
        }
      } else if (path === '/api/intake/submit' && method === 'POST') {
        const auth = await requireAuth(request, env)
        if (auth instanceof Response) {
          response = auth
        } else {
          let body: { answers?: any; locale?: 'ru' | 'en' }
          try { body = await request.json() } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }) }
          response = await handleIntakeSubmit(env.DB, auth.sub, { answers: body.answers ?? {}, locale: body.locale }, env.GEMINI_API_KEY)
          if (response.ok) ctx.waitUntil(runDemandRadar(env, auth.sub, body.answers ?? {}))
        }
      } else if (path === '/api/alumni' && method === 'GET') {
        const auth = await requireAuth(request, env)
        response = auth instanceof Response ? auth : await handleAlumniList(env.DB)
      } else if (path === '/api/alumni/me' && method === 'GET') {
        const auth = await requireAuth(request, env)
        response = auth instanceof Response ? auth : await handleAlumniMe(env.DB, auth.sub)
      } else if (path === '/api/alumni/optin' && method === 'POST') {
        const auth = await requireAuth(request, env)
        if (auth instanceof Response) {
          response = auth
        } else {
          let body: { optin?: boolean; contact?: string; blurb?: string; effort?: string }
          try { body = await request.json() } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }) }
          response = await handleAlumniOptin(env.DB, auth.sub, body)
        }
      } else if (path === '/api/academy/admission' && method === 'POST') {
        response = await handleAdmission(request, env)
      } else if (path === '/api/academy/me' && method === 'GET') {
        response = await handleAcademyMe(request, env)
      } else if (path === '/api/admin/leads' && method === 'GET') {
        const auth = await requireOwner(request, env)
        response = auth instanceof Response ? auth
          : await listLeads(env.DB, {
              q: url.searchParams.get('q') ?? undefined,
              limit: Number(url.searchParams.get('limit')) || undefined,
            })
      } else if (path === '/api/admin/leads/sync-crm' && method === 'POST') {
        const auth = await requireOwner(request, env)
        response = auth instanceof Response ? auth : await syncContacts(env)
      } else if (path === '/api/admin/stats' && method === 'GET') {
        const auth = await requireOwner(request, env)
        response = auth instanceof Response ? auth : await getStats(env.DB)
      } else if (path === '/api/admin/content-demand/briefs' && method === 'GET') {
        const auth = await requireOwner(request, env)
        response = auth instanceof Response ? auth : await listBriefs(env.DB, url.searchParams.get('status') ?? undefined)
      } else if (path === '/api/admin/content-demand/signals' && method === 'GET') {
        const auth = await requireOwner(request, env)
        response = auth instanceof Response ? auth : await listSignals(env.DB, url.searchParams.get('classification') ?? undefined)
      } else if (path.startsWith('/api/admin/content-demand/briefs/') && method === 'PATCH') {
        const auth = await requireOwner(request, env)
        if (auth instanceof Response) {
          response = auth
        } else {
          const id = path.split('/').pop() ?? ''
          let b: { status?: string }
          try { b = await request.json() } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }) }
          response = await decideBrief(env.DB, id, b.status ?? '')
        }
      } else {
        response = new Response('Not Found', { status: 404 })
      }

      const newHeaders = new Headers(response.headers)
      Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v))
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders })
    } catch (e) {
      console.error('Worker error:', e)
      return new Response(JSON.stringify({ error: 'Internal Server Error', message: e instanceof Error ? e.message : String(e) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runDailyNudge(env))
  },
}
