import { MoodType } from './MoodType'

export interface MoodEntry {
  date: string
  mood: MoodType
  recordedAt: string
}

export interface GetYearlyMoodResponse {
  entries: MoodEntry[]
  year: number
}
