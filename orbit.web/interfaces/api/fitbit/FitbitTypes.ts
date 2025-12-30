export interface FitbitAuthUrlResponse {
  authorizationUrl: string
  codeVerifier: string
}

export interface FitbitConnectionStatus {
  isConnected: boolean
  fitbitUserId?: string
  tokenExpiresAt?: string
}

export interface FitbitProfile {
  user?: {
    encodedId: string
    displayName: string
    avatar: string
    averageDailySteps: number
    memberSince: string
  }
}

export interface FitbitActivitySummary {
  summary?: {
    steps: number
    caloriesOut: number
    distances?: {
      activity: string
      distance: number
    }[]
    activeMinutes: number
    sedentaryMinutes: number
    lightlyActiveMinutes: number
    fairlyActiveMinutes: number
    veryActiveMinutes: number
    floors: number
  }
}
