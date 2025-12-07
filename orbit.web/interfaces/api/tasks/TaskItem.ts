import { TaskPriorityType } from './TaskPriorityType'

export interface TaskItem {
  id: number
  title: string
  description: string
  taskCategoryId: number
  priority: TaskPriorityType
  dueDate: string | null
  dateCompleted: string | null
}
