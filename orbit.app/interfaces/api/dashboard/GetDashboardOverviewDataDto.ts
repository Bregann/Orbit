import { TaskPriorityType } from '../tasks/TaskPriorityType'

export interface GetDashboardOverviewDataDto {
  moneyLeft: string
  moneySpent: string
  tasksCompleted: number
  totalTasks: number
  eventsScheduled: number
  upcomingTasks: UpcomingTasksData[]
  upcomingEvents: UpcomingEventsData[]
}

export interface UpcomingTasksData {
  taskId: number
  taskTitle: string
  priority: TaskPriorityType
  isCompleted: boolean
  dueDate?: string
}

export interface UpcomingEventsData {
  eventId: number
  eventTitle: string
  eventDate: string
  isAllDay: boolean
}

