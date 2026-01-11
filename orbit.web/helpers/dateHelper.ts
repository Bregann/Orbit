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
 * Converts a date to YYYY-MM-DD format
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export const toDateString = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * Checks if a date is today
 * @param date - Date object
 * @returns True if the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
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
