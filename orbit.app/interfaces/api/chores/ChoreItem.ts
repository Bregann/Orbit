import { ChoreFrequencyType } from './ChoreFrequencyType'

export interface ChoreItem {
  id: number
  name: string
  description: string
  frequency: ChoreFrequencyType
  customFrequencyDays: number | null
  nextDueDate: string
  lastCompletedAt: string | null
  createdAt: string
}
