import {
  IconMoodCrazyHappy,
  IconMoodHappy,
  IconMoodEmpty,
  IconMoodSad,
  IconMoodSmile
} from '@tabler/icons-react'
import { JournalMoodEnum } from '@/interfaces/api/journal/JournalMoodEnum'

export const moods = [
  { value: JournalMoodEnum.Great, label: 'Great', icon: IconMoodCrazyHappy, color: 'green' },
  { value: JournalMoodEnum.Good, label: 'Good', icon: IconMoodHappy, color: 'teal' },
  { value: JournalMoodEnum.Neutral, label: 'Neutral', icon: IconMoodEmpty, color: 'gray' },
  { value: JournalMoodEnum.Bad, label: 'Bad', icon: IconMoodSad, color: 'orange' },
  { value: JournalMoodEnum.Awful, label: 'Awful', icon: IconMoodSmile, color: 'red' },
]

export const getMoodIcon = (mood: JournalMoodEnum) => {
  const moodData = moods.find(m => m.value === mood)
  if (!moodData) return <IconMoodEmpty size="1rem" />
  const IconComponent = moodData.icon
  return <IconComponent size="1rem" />
}

export const getMoodColour = (mood: JournalMoodEnum) => {
  const moodData = moods.find(m => m.value === mood)
  return moodData?.color || 'gray'
}

export const getMoodLabel = (mood: number) => {
  const moodData = moods.find(m => m.value === mood)
  return moodData?.label || 'Unknown'
}
