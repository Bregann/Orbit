// Using RRule standard (RFC 5545) for recurrence rules
// This is the industry standard used by Google Calendar, Outlook, Apple Calendar, etc.

export interface CalendarEventType {
  id: string
  label: string
  color: string // Hex color code (e.g., '#3b82f6')
}

export interface CalendarEvent {
  id: number
  title: string
  date: string // ISO date - the starting date of the event or series
  startTime?: string // HH:mm format
  endTime?: string // HH:mm format
  isAllDay: boolean
  location?: string
  description?: string
  typeId: string
  attachments: number[]
  completed: boolean
  rrule?: string // RRule string (RFC 5545 standard) e.g., "FREQ=WEEKLY;BYDAY=SA;INTERVAL=1"
  instanceDate?: string // ISO date - for recurring events, the specific occurrence date that was clicked
}
