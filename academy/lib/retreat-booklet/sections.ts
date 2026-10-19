export const SECTION_IDS = ['cover', 'invitation', 'fit', 'experiences', 'days', 'schedule', 'leaders', 'team', 'place', 'food', 'pricing', 'inclusions', 'booking',
  'preparation', 'packing', 'travel', 'rules', 'payments', 'testimonials', 'faq', 'contact'] as const
export type SectionId = typeof SECTION_IDS[number]
export const REQUIRED_SECTIONS: SectionId[] = ['cover', 'fit', 'leaders', 'pricing', 'inclusions', 'booking', 'payments', 'contact']
