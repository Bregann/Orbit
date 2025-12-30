import { TaskPriorityType } from './TaskPriorityType'

export interface AddTaskRequest {
  title: string
  description: string
  taskCategoryId: number
  priority: TaskPriorityType
  dueDate: string | null
}
