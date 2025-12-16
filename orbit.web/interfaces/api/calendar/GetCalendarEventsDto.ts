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
}

export interface EventExceptionEntry {
  id: number
  calendarEventId: number
  exceptionDate: string // ISO date string
}
