import DashboardComponent from '@/components/pages/DashboardComponent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard'
}

export default async function Home() {
  return <DashboardComponent />
}
