export interface EditCalendarEventRequest {
  eventId: number
  eventName: string
  startTime: string // ISO datetime string
  endTime: string // ISO datetime string
  isAllDay: boolean
  eventLocation: string
  description: string | null
  calendarEventTypeId: number
  recurrenceRule: string | null
}
