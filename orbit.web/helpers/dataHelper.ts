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
