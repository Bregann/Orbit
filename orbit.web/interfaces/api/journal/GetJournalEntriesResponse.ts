import { JournalMoodEnum } from './JournalMoodEnum'

export interface GetJournalEntriesResponse {
  entries: JournalEntry[]
}

export interface JournalEntry {
  id: number
  title: string
  content: string
  createdAt: string
  mood: JournalMoodEnum
}
