import { ChoreFrequencyType } from './ChoreFrequencyType'

export interface AddChoreRequest {
  name: string
  description: string
  frequency: ChoreFrequencyType
  nextDueDate: string
  customFrequencyDays: number | null
}
