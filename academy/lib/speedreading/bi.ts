// lib/speedreading/bi.ts
// Двуязычная строка курса. В LMS этот тип жил в lib/course; академия не тянет
// движок курса ради одного типа — локальная копия из двух полей.
export interface Bi { ru: string; en: string }
