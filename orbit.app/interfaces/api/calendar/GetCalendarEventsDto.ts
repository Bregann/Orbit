export interface GetCalendarEventsDto {
  events: EventEntry[]
  eventExceptions: EventExceptionEntry[]
}

export interface EventEntry {
  id: number
  eventName: string
  eventLocation: string
  description: string | null
  startTime: string // ISO date string
  endTime: string // ISO date string
  isAllDay: boolean
  recurrenceRule: string | null // RRule string
  calendarEventTypeId: number
  calendarEventTypeName: string
  calendarEventTypeColour: string // hex colour
  instanceDate?: string // Optional client-side field for tracking which occurrence of recurring event was clicked (ISO date string)
  documentId: number | null
  documentFileName: string | null
  documentFileType: string | null
}

export interface EventExceptionEntry {
  id: number
  calendarEventId: number
  exceptionDate: string // ISO date string
}
