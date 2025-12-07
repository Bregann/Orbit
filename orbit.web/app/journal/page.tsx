import JournalComponent from '@/components/pages/JournalComponent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal'
}

export default function JournalPage() {
  return <JournalComponent />
}
