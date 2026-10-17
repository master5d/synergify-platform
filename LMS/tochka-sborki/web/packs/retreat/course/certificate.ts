// packs/retreat/course/certificate.ts
// Форма эталона; тексты — под курс «Ретрит с двух сторон», без обещаний. Сертификат у курса выключен
// (COURSE.features.certificate: false) — данные держат контракт и честны на случай включения.
import type { Locale } from '@/lib/dictionaries'
import { REGISTRY } from '@/lib/academy/registry'

const ORG = REGISTRY.academy.org.name

interface Bi { ru: string; en: string }

export interface CertificateData {
  brand: Bi
  ticketLabel: Bi
  heading: Bi
  presentedTo: Bi
  forCompleting: Bi
  courseName: Bi
  milestone: Bi      // 2 lines; '\n' splits them
  footerMeta: Bi
  founderName: Bi
  founderTitle: Bi
  publisher: Bi
  url: string
}

export interface ResolvedCertificate {
  brand: string
  ticketLabel: string
  heading: string
  presentedTo: string
  forCompleting: string
  courseName: string
  milestone: string
  footerMeta: string
  founderName: string
  founderTitle: string
  publisher: string
  url: string
}

export const CERT_PALETTE = {
  bg: '#0a0a0f',
  gold: '#e8c66a',
  goldDim: '#9a7f3c',
  primary: '#f0ece0',
  muted: '#9a927e',
  border: '#2a2620',
} as const

export const CERTIFICATE: CertificateData = {
  brand: { ru: 'РЕТРИТ С ДВУХ СТОРОН', en: 'A RETREAT FROM BOTH SIDES' },
  ticketLabel: { ru: 'ЗОЛОТОЙ БИЛЕТ', en: 'GOLDEN TICKET' },
  heading: { ru: 'Сертификат о прочтении', en: 'Certificate of Completion' },
  presentedTo: { ru: 'вручается', en: 'presented to' },
  forCompleting: { ru: 'за прочтение курса', en: 'for completing' },
  courseName: { ru: '«Ретрит с двух сторон»', en: 'A Retreat From Both Sides' },
  milestone: {
    ru: 'Одна сделка — две стороны.\nДаты, деньги и отмены сверены.',
    en: 'One deal — two sides.\nDates, money and cancellations line up.',
  },
  footerMeta: { ru: '24 урока · 6 модулей', en: '24 lessons · 6 modules' },
  founderName: { ru: 'Саша Мамаев', en: 'Sasha Mamaev' },
  founderTitle: { ru: 'основатель · академия S.A.S.H.A', en: 'Founder · S.A.S.H.A academy' },
  publisher: {
    ru: `представлено · ${ORG}`,
    en: `presented by · ${ORG}`,
  },
  url: 'academy.synergify.com/retrit/certificate',
}

export function resolveCertificate(
  locale: Locale,
  source: CertificateData = CERTIFICATE,
): ResolvedCertificate {
  return {
    brand: source.brand[locale],
    ticketLabel: source.ticketLabel[locale],
    heading: source.heading[locale],
    presentedTo: source.presentedTo[locale],
    forCompleting: source.forCompleting[locale],
    courseName: source.courseName[locale],
    milestone: source.milestone[locale],
    footerMeta: source.footerMeta[locale],
    founderName: source.founderName[locale],
    founderTitle: source.founderTitle[locale],
    publisher: source.publisher[locale],
    url: source.url,
  }
}
