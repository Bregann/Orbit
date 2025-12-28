export interface AddCalendarEventRequest {
  eventName: string
  eventLocation: string
  description: string
  startTime: string // ISO date string
  endTime: string // ISO date string
  isAllDay: boolean
  calendarEventTypeId: number
  recurrenceRule?: string | null
  documentId: number | null
}
