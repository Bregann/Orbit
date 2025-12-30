import { MoodType } from './MoodType'

export interface GetTodaysMoodResponse {
  hasMoodToday: boolean
  mood: MoodType | null
  recordedAt: string | null
}
