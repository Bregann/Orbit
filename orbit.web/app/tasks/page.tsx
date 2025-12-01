import TasksComponent from '@/components/pages/TasksComponent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasks'
}

export default function TasksPage() {
  return <TasksComponent />
}
