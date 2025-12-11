import { BillingFrequency } from './MonthlyPayment'

export interface UpdateSubscriptionRequest {
  id: number
  subscriptionName: string
  subscriptionAmount: number
  billingDay: number
  billingMonth?: number
  billingFrequency: BillingFrequency
}
