export interface DeleteCalendarEventRequest {
  eventId: number
  instanceDate: string | null // ISO date string - null means delete entire series
}
