import { ThemedText } from '@/components/themed-text'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { choresStyles } from '@/styles/choresStyles'
import type { ChoreItem } from '@/interfaces/api/chores/ChoreItem'
import { ChoreCard } from './ChoreCard'
import { View, TouchableOpacity, ActivityIndicator } from 'react-native'

interface ChoresListProps {
  overdue: ChoreItem[]
  upcoming: ChoreItem[]
  isLoading: boolean
  onComplete: (id: number) => void
  onEdit: (chore: ChoreItem) => void
  onDelete: (id: number) => void
  onAdd: () => void
  isDark: boolean
}

export function ChoresList({
  overdue,
  upcoming,
  isLoading,
  onComplete,
  onEdit,
  onDelete,
  onAdd,
  isDark,
}: ChoresListProps) {
  if (isLoading) {
    return (
      <View style={choresStyles.emptyContainer}>
        <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#3b82f6'} />
      </View>
    )
  }

  if (overdue.length === 0 && upcoming.length === 0) {
    return (
      <View style={choresStyles.emptyContainer}>
        <View style={choresStyles.emptyIcon}>
          <IconSymbol name="house" size={48} color={isDark ? '#4b5563' : '#9ca3af'} />
        </View>
        <ThemedText style={[choresStyles.emptyTitle, { color: isDark ? '#d1d5db' : '#374151' }]}>
          No chores yet
        </ThemedText>
        <ThemedText style={[choresStyles.emptySubtitle, { color: isDark ? '#6b7280' : '#9ca3af' }]}>
          Add recurring household tasks to keep track of what needs doing
        </ThemedText>
        <TouchableOpacity
          style={[
            choresStyles.screenHeaderButton,
            { backgroundColor: '#0a7ea4', marginTop: 20 },
          ]}
          onPress={onAdd}
        >
          <ThemedText style={{ color: '#ffffff', fontWeight: '600' }}>Add Your First Chore</ThemedText>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View>
      {overdue.length > 0 && (
        <>
          <ThemedText style={[choresStyles.sectionHeader, { color: '#ef4444' }]}>
            Overdue ({overdue.length})
          </ThemedText>
          {overdue.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              isDark={isDark}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <ThemedText style={[choresStyles.sectionHeader, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
            Upcoming ({upcoming.length})
          </ThemedText>
          {upcoming.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              isDark={isDark}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </>
      )}
    </View>
  )
}
