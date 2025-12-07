import GroceryComponent from '@/components/pages/GroceryComponent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Grocery List'
}

export default function GroceryPage() {
  return <GroceryComponent />
}
