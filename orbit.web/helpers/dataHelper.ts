import { TaskPriorityType } from '@/interfaces/api/tasks/TaskPriorityType'

export const getPriorityColour = (priority: TaskPriorityType) => {
  switch (priority) {
    case TaskPriorityType.Critical: return 'red'
    case TaskPriorityType.High: return 'orange'
    case TaskPriorityType.Medium: return 'yellow'
    case TaskPriorityType.Low: return 'blue'
    default: return 'gray'
  }
}

export const getPriorityLabel = (priority: TaskPriorityType): string => {
  switch (priority) {
    case TaskPriorityType.Critical: return 'Critical'
    case TaskPriorityType.High: return 'High'
    case TaskPriorityType.Medium: return 'Medium'
    case TaskPriorityType.Low: return 'Low'
    default: return 'Unknown'
  }
}

export interface EventType {
  id: number
  eventTypeName: string
  hexColourCode: string
}

export const getEventTypeColour = (typeId: number, eventTypes: EventType[]) => {
  return eventTypes.find(t => t.id === typeId)?.hexColourCode || '#6b7280'
}

export const getEventTypeLabel = (typeId: number, eventTypes: EventType[]) => {
  return eventTypes.find(t => t.id === typeId)?.eventTypeName || 'Unknown'
}
