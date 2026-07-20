/**
 * Centralised date helper for the Orbit mobile app.
 *
 * Every date-formatting or date-comparison utility lives here so that
 * components never repeat the same logic inline.  All public functions
 * accept an ISO-8601 date string (as returned by the API) and return
 * either a formatted string or a boolean.
 *
 * Usage:
 *   import { formatRelativeDate, isOverdue, toUtcDateString } from '@/helpers/dateHelper'
 */

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers — not exported (keeps the public API clean)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses an ISO date string into a Date with the time zeroed to midnight (UTC).
 */
function parseDate(dateStr: string): Date {
  const d = new Date(dateStr)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/**
 * Returns a Date representing today at midnight (UTC).
 */
function todayUtc(): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d
}

// ─────────────────────────────────────────────────────────────────────────────
// Public formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a date **relative to today**.
 *
 * | Difference | Output           |
 * |-----------|------------------|
 * | 0 days    | `"Today"`        |
 * | +1 day    | `"Tomorrow"`     |
 * | < 0 days  | `"3d overdue"`   |
 * | ≥ 2 days  | `"15 Jul"`       |
 */
export function formatRelativeDate(dateStr: string): string {
  const due = parseDate(dateStr)
  const today = todayUtc()

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  }
  if (diffDays === 1) {
    return 'Tomorrow'
  }
  if (diffDays < 0) {
    return `${Math.abs(diffDays)}d overdue`
  }
  return due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/**
 * Short date with year — e.g. `"20 Jul 2026"`.
 */
export function formatShortDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Day + abbreviated month only — e.g. `"20 Jul"`.
 */
export function formatDayMonth(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Long human-readable date — e.g. `"Monday, 20 July 2026"`.
 */
export function formatLongDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Weekday + day + short month — e.g. `"Mon, 20 Jul"`.
 */
export function formatWeekdayDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Public comparison helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns `true` when `dateStr` is **before** today (the chore / task is late).
 */
export function isOverdue(dateStr: string): boolean {
  return daysFromNow(dateStr) < 0
}

/**
 * Returns `true` when `dateStr` falls on today.
 */
export function isToday(dateStr: string): boolean {
  return daysFromNow(dateStr) === 0
}

/**
 * Returns `true` when `dateStr` is tomorrow.
 */
export function isTomorrow(dateStr: string): boolean {
  return daysFromNow(dateStr) === 1
}

/**
 * Signed number of whole days from today to `dateStr`.
 *
 * - Positive  → future date
 * - Zero      → today
 * - Negative  → overdue (past)
 */
export function daysFromNow(dateStr: string): number {
  const due = parseDate(dateStr)
  const today = todayUtc()
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversion helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a JavaScript `Date` into an ISO-8601 UTC midnight string suitable
 * for sending to the API.
 *
 * Example: `toUtcDateString(new Date(2026, 6, 20))` → `"2026-07-20T00:00:00.000Z"`
 */
export function toUtcDateString(date: Date): string {
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )).toISOString()
}
