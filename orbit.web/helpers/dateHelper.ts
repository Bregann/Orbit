/**
 * Formats a date string to display "Today", "Tomorrow", or a short date
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatRelativeDate = (dateString: string): string => {
  if (!dateString) return 'No date'

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)

  if (compareDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (compareDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  }
}

/**
 * Formats a date for input fields (YYYY-MM-DD)
 * @param date - Date object or null
 * @returns Formatted date string
 */
export const formatDateForInput = (date: Date | null): string => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats a date with time (e.g., "29 Jul 2026, 19:30")
 * @param dateString - ISO date string
 * @param time - Time string (HH:MM)
 * @param isAllDay - Whether the event is all day
 * @returns Formatted date and time string
 */
export const formatDateWithTime = (dateString: string, time?: string, isAllDay?: boolean): string => {
  const date = new Date(dateString + 'T00:00:00')
  const dateStr = date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  if (isAllDay) {
    return `${dateStr} (All day)`
  } else if (time) {
    return `${dateStr}, ${time}`
  }

  return dateStr
}

/**
 * Converts a date to YYYY-MM-DD format using the date's *local* calendar
 * fields.
 *
 * Deliberately avoids `toISOString()`, which converts to UTC first: for any
 * timezone ahead of UTC a local-midnight Date (as produced by the calendar
 * grid) rolls back to the previous day. e.g. in BST, 19 Sep 00:00 local is
 * 18 Sep 23:00 UTC, so `toISOString()` yields "2026-09-18".
 *
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export const toDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Extracts the calendar date (YYYY-MM-DD) from an API date string without any
 * timezone conversion.
 *
 * Calendar events are wall-clock dates: an all-day event on the 19th is the
 * 19th regardless of the viewer's timezone. The API serialises these with a
 * `Z` suffix, so parsing via `new Date(...)` would shift them. Taking the date
 * portion verbatim preserves the intended day.
 *
 * @param dateString - ISO date string from the API
 * @returns Date string in YYYY-MM-DD format
 */
export const toApiDateString = (dateString: string): string => {
  if (!dateString) {
    return ''
  }
  return dateString.split('T')[0]
}

/**
 * Today's date as YYYY-MM-DD in the viewer's local timezone.
 */
export const todayDateString = (): string => toDateString(new Date())

/**
 * Converts a local calendar date into a UTC-midnight ISO string for the API.
 *
 * Builds the instant from the date's local calendar fields so the day is
 * preserved. `new Date('2026-09-19').toISOString()` would instead re-interpret
 * the value and can shift it.
 *
 * @param date - Date object, or a YYYY-MM-DD string
 * @returns ISO-8601 string at UTC midnight, e.g. "2026-09-19T00:00:00.000Z"
 */
export const toUtcDateString = (date: Date | string): string => {
  const dateStr = typeof date === 'string' ? toApiDateString(date) : toDateString(date)
  return new Date(`${dateStr}T00:00:00Z`).toISOString()
}

/**
 * The Monday-start week containing today, as local YYYY-MM-DD strings.
 *
 * Shared between the meal planner page (server-side prefetch) and its
 * component so both request exactly the same range — otherwise the prefetched
 * cache entry never matches the one the client asks for.
 */
export const getCurrentWeekRange = (): { startDate: string, endDate: string } => {
  const days = getCurrentWeekDates()
  return { startDate: days[0], endDate: days[6] }
}

/**
 * The seven local dates of the Monday-start week containing today.
 */
export const getCurrentWeekDates = (): string[] => {
  const today = new Date()
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  monday.setDate(monday.getDate() - ((today.getDay() + 6) % 7))

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return toDateString(d)
  })
}

/**
 * Returns `true` when `dateStr` falls on today.  Accepts an ISO date
 * string or a Date object.
 */
export const isToday = (dateInput: string | Date): boolean => {
  if (!dateInput) {
    return false
  }

  // Compare calendar dates, not instants. Note this must not mutate the
  // caller's Date — the calendar grid passes the same objects it renders.
  const dateStr = typeof dateInput === 'string'
    ? toApiDateString(dateInput)
    : toDateString(dateInput)

  return dateStr === toDateString(new Date())
}

/**
 * Checks if a date is in the past
 * @param date - Date object
 * @returns True if the date is before today
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate < today
}

/**
 * Formats a date string to long format (e.g., "Monday, 19 December 2025")
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatLongDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Returns `true` when the given ISO date string is before today.
 */
export const isOverdue = (dateStr: string): boolean => {
  if (!dateStr) {
    return false
  }
  // String comparison is safe and timezone-free for YYYY-MM-DD.
  return toApiDateString(dateStr) < toDateString(new Date())
}

/**
 * Short date with year — e.g. `"20 Jul 2026"`.
 */
export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) {
    return ''
  }
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
