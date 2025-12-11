import { BillingFrequency } from './MonthlyPayment'

export interface AddSubscriptionRequest {
  subscriptionName: string
  subscriptionAmount: number
  billingDay: number
  billingMonth?: number
  billingFrequency: BillingFrequency
}
