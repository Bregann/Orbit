/* eslint-disable no-unused-vars */
export interface SubscriptionItem {
  id: number
  name: string
  amount: number
  monthlyAmount: number
  billingDay: number
  billingMonth?: number
  billingFrequency: BillingFrequency
  nextBillingDate: string
}

export enum BillingFrequency {
  Monthly = 0,
  Yearly = 1
}

export const BillingFrequencyOptions = [
  { value: '0', label: 'Monthly' },
  { value: '1', label: 'Yearly' }
]
