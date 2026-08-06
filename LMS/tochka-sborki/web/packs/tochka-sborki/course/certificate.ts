// lib/course/certificate.ts
// Golden-ticket certificate course-data (fb_6ded7b0b7980). The SVG component is the
// engine; this file holds the Tochka-Sborki golden-ticket copy + palette.
// Admission is granted server-side on verified completion (S4, fb_97517f307a46);
// the certificate page requests it fire-and-forget.
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
  brand: { ru: 'ТОЧКА СБОРКИ', en: 'TOCHKA SBORKI' },
  ticketLabel: { ru: 'ЗОЛОТОЙ БИЛЕТ', en: 'GOLDEN TICKET' },
  heading: { ru: 'Сертификат о прохождении', en: 'Certificate of Completion' },
  presentedTo: { ru: 'вручается', en: 'presented to' },
  forCompleting: { ru: 'за прохождение курса', en: 'for completing' },
  courseName: { ru: '«Точка Сборки»', en: 'Tochka Sborki' },
  milestone: {
    ru: 'Точка сборки пройдена.\nТы готов(а) к следующему витку.',
    en: 'The assembly point is set.\nYou’re ready for what comes next.',
  },
  footerMeta: { ru: '28 юнитов · 7 тем', en: '28 units · 7 topics' },
  founderName: { ru: 'Саша Мамаев', en: 'Sasha Mamaev' },
  founderTitle: { ru: 'основатель · Точка Сборки', en: 'Founder · Tochka Sborki' },
  publisher: {
    ru: `представлено · ${ORG}`,
    en: `presented by · ${ORG}`,
  },
  url: 'ai.synergify.com/certificate',
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
