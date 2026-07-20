import { ChoreFrequencyType } from '@/interfaces/api/chores/ChoreFrequencyType'

/**
 * Returns a human-readable label for a chore frequency enum value.
 *
 * | Enum value              | Returns      |
 * |-------------------------|--------------|
 * | `ChoreFrequencyType.Daily`     | `"Daily"`     |
 * | `ChoreFrequencyType.Weekly`    | `"Weekly"`    |
 * | `ChoreFrequencyType.Biweekly`  | `"Biweekly"`  |
 * | `ChoreFrequencyType.Monthly`   | `"Monthly"`   |
 */
export function getFrequencyLabel(freq: ChoreFrequencyType): string {
  switch (freq) {
    case ChoreFrequencyType.Daily:
      return 'Daily'
    case ChoreFrequencyType.Weekly:
      return 'Weekly'
    case ChoreFrequencyType.Biweekly:
      return 'Biweekly'
    case ChoreFrequencyType.Monthly:
      return 'Monthly'
    case ChoreFrequencyType.SixMonthly:
      return '6 Monthly'
    case ChoreFrequencyType.Custom:
      return 'Custom'
    default:
      return 'Unknown'
  }
}

/**
 * Returns a hex colour code for a chore frequency, with separate light/dark
 * variants to work across colour schemes.
 *
 * | Frequency  | Light      | Dark       |
 * |------------|------------|------------|
 * | Daily      | `#2563eb`  | `#4a9eff`  |
 * | Weekly     | `#3b82f6`  | `#60a5fa`  |
 * | Biweekly   | `#7c3aed`  | `#a78bfa`  |
 * | Monthly    | `#db2777`  | `#f472b6`  |
 */
export function getFrequencyColour(freq: ChoreFrequencyType, isDark: boolean): string {
  switch (freq) {
    case ChoreFrequencyType.Daily:
      return isDark ? '#4a9eff' : '#2563eb'
    case ChoreFrequencyType.Weekly:
      return isDark ? '#60a5fa' : '#3b82f6'
    case ChoreFrequencyType.Biweekly:
      return isDark ? '#a78bfa' : '#7c3aed'
    case ChoreFrequencyType.Monthly:
      return isDark ? '#f472b6' : '#db2777'
    case ChoreFrequencyType.SixMonthly:
      return isDark ? '#fb923c' : '#ea580c'
    case ChoreFrequencyType.Custom:
      return isDark ? '#a3e635' : '#65a30d'
    default:
      return isDark ? '#9ca3af' : '#6b7280'
  }
}

/**
 * Chore frequency options used by frequency-picker UI
 * (AddChoreModal, EditChoreModal, etc.).  Each entry has a human-readable
 * `label` and the corresponding enum `value`.
 */
export const FREQUENCIES = [
  { label: 'Daily', value: ChoreFrequencyType.Daily },
  { label: 'Weekly', value: ChoreFrequencyType.Weekly },
  { label: 'Biweekly', value: ChoreFrequencyType.Biweekly },
  { label: 'Monthly', value: ChoreFrequencyType.Monthly },
  { label: '6 Monthly', value: ChoreFrequencyType.SixMonthly },
  { label: 'Custom', value: ChoreFrequencyType.Custom },
] as const
