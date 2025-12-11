export interface GetCalendarEventTypesDto {
  eventTypes: CalendarEventTypeItem[]
}

export interface CalendarEventTypeItem {
  id: number
  eventTypeName: string
  hexColourCode: string
}
