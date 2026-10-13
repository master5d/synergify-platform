// Network timeouts are explicit so every outbound worker request has a bounded lifetime.
// Interactive paths are short; best-effort background work gets a little more room to finish.

// Stripe is on the interactive checkout path; fail promptly so the user can retry.
export const STRIPE_TIMEOUT_MS = 10_000
// Google token and userinfo calls are on the interactive login path; keep sign-in responsive.
export const GOOGLE_TIMEOUT_MS = 10_000
// Telegram replies are interactive bot responses; do not hold the webhook open for long.
export const TELEGRAM_TIMEOUT_MS = 10_000
// CRM sync is best-effort during signup; allow a little longer without delaying the response.
export const CRM_TIMEOUT_MS = 15_000
// Progress events are best-effort background work; allow listmonk more time to accept updates.
export const PROGRESS_EVENTS_TIMEOUT_MS = 15_000
// SES delivery is best-effort for auth/notifications; bounded but longer than an interactive API call.
export const SES_TIMEOUT_MS = 20_000
