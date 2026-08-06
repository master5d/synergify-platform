import type { Env } from './types'
import { sendEmailSES } from './ses'

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()

export interface WelcomeEmail {
  subject: string
  text: string
  html: string
  listUnsubscribe: string   // value for the List-Unsubscribe header
}

// lang: 'en' → English; anything else → Russian (default), mirroring buildMagicLinkEmail.
export function buildWelcomeEmail(
  lang: string,
  ctx: { verifyUrl: string; ownerEmail: string },
): WelcomeEmail {
  const en = lang === 'en'
  const base = 'https://ai.synergify.com'
  const prefix = en ? '/en' : ''
  const intake = `${base}${prefix}/quest-intake/`
  const cheatsheet = `${base}${prefix}/cheatsheet/`
  const magic = ctx.verifyUrl
  const listUnsubscribe = `<mailto:${ctx.ownerEmail}?subject=unsubscribe>`

  if (en) {
    const subject = 'Welcome to Tochka Sborki'
    const text = `Hi there,

You've just joined Tochka Sborki — glad you're here.

Quick why. I spent 13 years as a coach and mentor, and a producer before that. When agentic AI arrived, I feared exactly what many creative people fear: "it'll do it for me — and then it won't be me." The opposite turned out to be true — AI doesn't replace your voice, it amplifies it and takes the busywork off your plate, once you know how to talk to it. That's what this course teaches. Free. All of it.

The thing I hear most: "I don't even know what to want from AI." That's normal — no one showed you the menu. So step one here isn't "study" — it's "see what's even possible".

Two steps to start:

1. Take the intake quest → ${intake}
   10 minutes. The course tailors itself to your niche and goal — everything after is about you, not "in general".

2. Open module 1 and set up your tools → ${magic}
   One button signs you in, no password. Start with the map of the terrain.

If you want one quick win right now:
Cheatsheet — the moves that actually work, on one page → ${cheatsheet}

What you won't get here: no spam, no fluff, no "buy before it's gone" pressure. The course is free and stays free. If it's not for you, you can unsubscribe with the "Unsubscribe" button in your mail client.

See you in the flow,
Alexander Mamaev (Ravi Angad Singh)
author of the Tochka Sborki course`
    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px">
<p>Hi there,</p>
<p>You've just joined <strong>Tochka Sborki</strong> — glad you're here.</p>
<p>Quick why. I spent 13 years as a coach and mentor, and a producer before that. When agentic AI arrived, I feared exactly what many creative people fear: "it'll do it <em>for</em> me — and then it won't be me." The opposite turned out to be true — AI doesn't replace your voice, it <em>amplifies</em> it and takes the busywork off your plate, once you know how to talk to it. That's what this course teaches. Free. All of it.</p>
<p>The thing I hear most: "I don't even know what to want from AI." That's normal — no one showed you the menu. So step one here isn't "study" — it's <strong>"see what's even possible"</strong>.</p>
<p><strong>Two steps to start:</strong></p>
<ol>
<li><a href="${intake}">Take the intake quest</a> — 10 minutes. The course tailors itself to your niche and goal.</li>
<li><a href="${magic}">Open module 1 and set up your tools</a> — one button signs you in, no password.</li>
</ol>
<p>If you want one quick win right now: <a href="${cheatsheet}">the cheatsheet</a> — the moves that actually work, on one page.</p>
<p style="color:#555"><strong>What you won't get here:</strong> no spam, no fluff, no "buy before it's gone" pressure. The course is free and stays free. If it's not for you, unsubscribe with the "Unsubscribe" button in your mail client.</p>
<p>See you in the flow,<br><strong>Alexander Mamaev</strong> (Ravi Angad Singh)<br><em>author of the Tochka Sborki course</em></p>
</div>`
    return { subject, text, html, listUnsubscribe }
  }

  const subject = 'Добро пожаловать в Точку Сборки'
  const text = `Привет!

Вы зарегистрировались в «Точке Сборки» — рад, что вы здесь.

Коротко зачем это всё. Я 13 лет был коучем и наставником, а до того продюсером. Когда пришёл агентный AI, я испугался того же, чего боятся многие creative-люди: «он сделает за меня — и это будет уже не я». Оказалось наоборот — AI не заменяет ваш голос, а усиливает его и снимает рутину, если знать, как с ним говорить. Этому и учит курс. Бесплатно. Полностью.

Самое частое, что я слышу: «я даже не знаю, чего хотеть от AI». Это нормально — никто не показал меню. Поэтому первый шаг здесь не «учись», а «посмотри, что вообще возможно».

Два шага, чтобы начать:

1. Пройдите intake-квест → ${intake}
   10 минут. Курс подстроится под вашу нишу и цель — дальше всё будет про вас, а не «вообще».

2. Откройте первый модуль и поставьте инструменты → ${magic}
   Одна кнопка — вы внутри, без пароля. Начните с карты местности.

На случай «с чего ухватиться прямо сейчас»:
Шпаргалка — самые рабочие приёмы на одной странице → ${cheatsheet}

Чего тут НЕ будет: ни спама, ни воды, ни дожимающих писем «успей купить». Курс бесплатный и останется бесплатным. Если что-то не зайдёт — отписаться можно кнопкой «Unsubscribe» в вашей почте.

До встречи в потоке,
Александр Мамаев (Рави Ангад Синх)
автор курса «Точка Сборки»`
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px">
<p>Привет!</p>
<p>Вы зарегистрировались в <strong>«Точке Сборки»</strong> — рад, что вы здесь.</p>
<p>Коротко зачем это всё. Я 13 лет был коучем и наставником, а до того продюсером. Когда пришёл агентный AI, я испугался того же, чего боятся многие creative-люди: «он сделает за меня — и это будет уже не я». Оказалось наоборот — AI не заменяет ваш голос, а <em>усиливает</em> его и снимает рутину, если знать, как с ним говорить. Этому и учит курс. Бесплатно. Полностью.</p>
<p>Самое частое, что я слышу: «я даже не знаю, чего хотеть от AI». Это нормально — никто не показал меню. Поэтому первый шаг здесь не «учись», а <strong>«посмотри, что вообще возможно»</strong>.</p>
<p><strong>Два шага, чтобы начать:</strong></p>
<ol>
<li><a href="${intake}">Пройдите intake-квест</a> — 10 минут. Курс подстроится под вашу нишу и цель.</li>
<li><a href="${magic}">Откройте первый модуль и поставьте инструменты</a> — одна кнопка, вы внутри, без пароля.</li>
</ol>
<p>На случай «с чего ухватиться прямо сейчас»: <a href="${cheatsheet}">шпаргалка</a> — самые рабочие приёмы на одной странице.</p>
<p style="color:#555"><strong>Чего тут НЕ будет:</strong> ни спама, ни воды, ни дожимающих писем «успей купить». Курс бесплатный и останется бесплатным. Если что-то не зайдёт — отписаться можно кнопкой «Unsubscribe» в вашей почте.</p>
<p>До встречи в потоке,<br><strong>Александр Мамаев</strong> (Рави Ангад Синх)<br><em>автор курса «Точка Сборки»</em></p>
</div>`
  return { subject, text, html, listUnsubscribe }
}

// Best-effort welcome send (mirrors owner-notify.ts / purchase-email.ts). Never throws; returns whether it sent.
export async function sendWelcomeEmail(
  env: Env,
  p: { email: string; lang: string; verifyUrl: string },
): Promise<boolean> {
  if (!strip(env.SES_ACCESS_KEY_ID)) return false
  const mail = buildWelcomeEmail(p.lang, { verifyUrl: p.verifyUrl, ownerEmail: strip(env.OWNER_EMAIL) })
  const res = await sendEmailSES(env, {
    from: 'Точка Сборки <noreply@synergify.com>',
    to: p.email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    headers: { 'List-Unsubscribe': mail.listUnsubscribe },
  })
  if (!res.ok) { console.error('welcome-email non-OK', res.status, res.error); return false }
  return true
}
