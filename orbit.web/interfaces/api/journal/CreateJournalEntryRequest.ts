import { JournalMoodEnum } from './JournalMoodEnum'

export interface CreateJournalEntryRequest {
  title: string
  content: string
  mood: JournalMoodEnum
}
