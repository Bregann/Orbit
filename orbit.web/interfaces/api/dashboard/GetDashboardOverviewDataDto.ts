import { TaskPriorityType } from '../tasks/TaskPriorityType'

export interface GetDashboardOverviewDataDto {
  moneyLeft: string
  moneySpent: string
  tasksCompleted: number
  totalTasks: number
  eventsScheduled: number
  todaysTasks: TodaysTasksData[]
  upcomingEvents: UpcomingEventsData[]
}

export interface TodaysTasksData {
  taskId: number
  taskTitle: string
  priority: TaskPriorityType
  isCompleted: boolean
}

export interface UpcomingEventsData {
  eventId: number
  eventTitle: string
  eventDate: string
}

