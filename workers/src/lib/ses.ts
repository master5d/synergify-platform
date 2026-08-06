import { AwsClient } from 'aws4fetch'
import type { Env } from './types'

export interface SesMessage {
  from: string
  to: string
  subject: string
  text: string
  html?: string
  headers?: Record<string, string>
}

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()

// Транзакционная отправка через SES v2 SendEmail (Simple). SigV4 через aws4fetch.
// From не меняется относительно прежнего Resend-вызова; headers маппятся в Simple.Headers.
export async function sendEmailSES(env: Env, msg: SesMessage): Promise<{ ok: boolean; status: number; error?: string }> {
  const region = strip(env.SES_REGION) || 'us-east-1'
  const aws = new AwsClient({
    accessKeyId: strip(env.SES_ACCESS_KEY_ID),
    secretAccessKey: strip(env.SES_SECRET_ACCESS_KEY),
    region,
    service: 'ses',
  })
  const body: Record<string, unknown> = {
    FromEmailAddress: msg.from,
    Destination: { ToAddresses: [msg.to] },
    Content: {
      Simple: {
        Subject: { Data: msg.subject },
        Body: {
          Text: { Data: msg.text },
          ...(msg.html ? { Html: { Data: msg.html } } : {}),
        },
        ...(msg.headers && Object.keys(msg.headers).length
          ? { Headers: Object.entries(msg.headers).map(([Name, Value]) => ({ Name, Value })) }
          : {}),
      },
    },
  }
  try {
    const res = await aws.fetch(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const error = await res.text()
      console.error('SES send non-OK', res.status, error)
      return { ok: false, status: res.status, error }
    }
    return { ok: true, status: res.status }
  } catch (e) {
    console.error('SES send threw', e)
    return { ok: false, status: 0, error: e instanceof Error ? e.message : String(e) }
  }
}
