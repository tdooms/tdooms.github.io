// Single source of truth for date display. Three components used to inline
// their own `toLocaleDateString` calls and quietly drifted apart (en-GB on
// blog cards, en-US on news and resume entries). One locale, three shapes:
//
//   formatDate(d)      → "1 Jan 2024"     (blog cards)
//   formatFullDate(d)  → "1 January 2024" (blog post header)
//   formatMonthYear(d) → "Jan 2024"       (news rows, resume entries)

const LOCALE = 'en-GB'

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })

export const formatFullDate = (date: string): string =>
  new Date(date).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' })

export const formatMonthYear = (date: string): string =>
  new Date(date).toLocaleDateString(LOCALE, { month: 'short', year: 'numeric' })
