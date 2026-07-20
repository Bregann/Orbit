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
 * Returns a Mantine colour token name for a chore frequency.
 *
 * | Frequency   | Token       |
 * |-------------|-------------|
 * | Daily       | `blue`      |
 * | Weekly      | `cyan`      |
 * | Biweekly    | `violet`    |
 * | Monthly     | `pink`      |
 * | 6 Monthly   | `orange`    |
 * | Custom      | `lime`      |
 */
export function getFrequencyColour(freq: ChoreFrequencyType): string {
  switch (freq) {
    case ChoreFrequencyType.Daily:
      return 'blue'
    case ChoreFrequencyType.Weekly:
      return 'cyan'
    case ChoreFrequencyType.Biweekly:
      return 'violet'
    case ChoreFrequencyType.Monthly:
      return 'pink'
    case ChoreFrequencyType.SixMonthly:
      return 'orange'
    case ChoreFrequencyType.Custom:
      return 'lime'
    default:
      return 'gray'
  }
}
