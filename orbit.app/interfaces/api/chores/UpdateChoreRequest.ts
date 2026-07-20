import { ChoreFrequencyType } from './ChoreFrequencyType'

export interface UpdateChoreRequest {
  id: number
  name: string
  description: string
  frequency: ChoreFrequencyType
  customFrequencyDays: number | null
  nextDueDate: string
}
