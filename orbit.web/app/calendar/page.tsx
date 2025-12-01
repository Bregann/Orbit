import CalendarComponent from '@/components/pages/CalendarComponent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendar'
}

export default function CalendarPage() {
  return <CalendarComponent />
}
