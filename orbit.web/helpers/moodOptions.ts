import {
  IconMoodCrazyHappy,
  IconMoodHappy,
  IconMoodEmpty,
  IconMoodSad,
  IconMoodConfuzed
} from '@tabler/icons-react'
import { MoodType } from '@/interfaces/api/mood/MoodType'

export interface MoodOption {
  type: MoodType
  label: string
  icon: React.ComponentType<{ size?: string | number }>
  color: string
}

export const moodOptions: MoodOption[] = [
  { type: MoodType.Excellent, label: 'Excellent', icon: IconMoodCrazyHappy, color: 'green' },
  { type: MoodType.Good, label: 'Good', icon: IconMoodHappy, color: 'teal' },
  { type: MoodType.Neutral, label: 'Neutral', icon: IconMoodEmpty, color: 'yellow' },
  { type: MoodType.Low, label: 'Low', icon: IconMoodSad, color: 'orange' },
  { type: MoodType.Difficult, label: 'Difficult', icon: IconMoodConfuzed, color: 'red' }
]

export const getMoodOption = (moodType: MoodType): MoodOption => {
  return moodOptions.find(option => option.type === moodType) || moodOptions[2]
}
