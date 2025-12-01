import DocumentsComponent from '@/components/pages/DocumentsComponent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documents'
}

export default function DocumentsPage() {
  return <DocumentsComponent />
}
