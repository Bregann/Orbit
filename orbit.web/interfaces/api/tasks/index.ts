// Task Priority enum matching C# TaskPriorityType
export enum TaskPriorityType {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

// Response DTOs
export interface GetTasksResponse {
  tasks: TaskItem[]
}

export interface TaskItem {
  id: number
  title: string
  description: string
  taskCategoryId: number
  priority: TaskPriorityType
  dueDate: string | null
  dateCompleted: string | null
}

export interface GetTaskCategoriesResponse {
  categories: TaskCategoryItem[]
}

export interface TaskCategoryItem {
  id: number
  name: string
}

// Request DTOs
export interface AddTaskRequest {
  title: string
  description: string
  taskCategoryId: number
  priority: TaskPriorityType
  dueDate: string | null
}

export interface AddNewCategoryRequest {
  name: string
}
