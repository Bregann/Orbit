import { ThemedText } from '@/components/themed-text'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { choresStyles } from '@/styles/choresStyles'
import type { ChoreItem } from '@/interfaces/api/chores/ChoreItem'
import { formatRelativeDate, formatShortDate, isOverdue } from '@/helpers/dateHelper'
import { getFrequencyLabel, getFrequencyColour } from '@/helpers/choreHelper'
import { View, TouchableOpacity } from 'react-native'

interface ChoreCardProps {
  chore: ChoreItem
  isDark: boolean
  onComplete: (id: number) => void
  onEdit: (chore: ChoreItem) => void
  onDelete: (id: number) => void
}

export function ChoreCard({ chore, isDark, onComplete, onEdit, onDelete }: ChoreCardProps) {
  const freqColour = getFrequencyColour(chore.frequency, isDark)
  const overdue = isOverdue(chore.nextDueDate)

  return (
    <View
      style={[
        choresStyles.choreCard,
        {
          backgroundColor: isDark ? '#1D2026' : '#ffffff',
          borderColor: overdue ? '#ef4444' : isDark ? '#2F333B' : '#e5e7eb',
        },
      ]}
    >
      <View style={choresStyles.choreHeader}>
        <ThemedText style={choresStyles.choreName}>{chore.name}</ThemedText>
      </View>

      {chore.description ? (
        <ThemedText
          style={[choresStyles.choreDescription, { color: isDark ? '#9ca3af' : '#6b7280' }]}
          numberOfLines={2}
        >
          {chore.description}
        </ThemedText>
      ) : null}

      <View style={choresStyles.choreMeta}>
        <View style={choresStyles.choreMetaLeft}>
          <View style={[choresStyles.frequencyBadge, { backgroundColor: freqColour + '20' }]}>
            <ThemedText style={[choresStyles.frequencyText, { color: freqColour }]}>
              {getFrequencyLabel(chore.frequency)}
            </ThemedText>
          </View>
          <View>
            <ThemedText
              style={[
                choresStyles.dueDateText,
                overdue && { color: '#ef4444' },
                overdue && choresStyles.dueDateOverdue,
              ]}
            >
              {overdue ? '⚠ ' : ''}Due: {formatRelativeDate(chore.nextDueDate)}
            </ThemedText>
            {chore.lastCompletedAt && (
              <ThemedText style={[choresStyles.dueDateText, { color: isDark ? '#6b7280' : '#9ca3af', fontSize: 11 }]}>
                Done: {formatShortDate(chore.lastCompletedAt)}
              </ThemedText>
            )}
          </View>
        </View>

        <View style={choresStyles.choreMetaRight}>
          <TouchableOpacity
            style={[choresStyles.actionButton, { backgroundColor: '#22c55e20' }]}
            onPress={() => onComplete(chore.id)}
          >
            <IconSymbol name="checkmark.circle" size={20} color="#22c55e" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[choresStyles.actionButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
            onPress={() => onEdit(chore)}
          >
            <IconSymbol name="pencil" size={18} color={isDark ? '#d1d5db' : '#374151'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[choresStyles.actionButton, { backgroundColor: '#ef444420' }]}
            onPress={() => onDelete(chore.id)}
          >
            <IconSymbol name="trash" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
