import { ThemedText } from '@/components/themed-text'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { QueryKeys } from '@/helpers/QueryKeys'
import { isOverdue } from '@/helpers/dateHelper'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import { useMutationPut } from '@/helpers/mutations/useMutationPut'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import { useMutationPatch } from '@/helpers/mutations/useMutationPatch'
import { ChoresList } from '@/components/chores/ChoresList'
import { AddChoreModal } from '@/components/chores/AddChoreModal'
import { EditChoreModal } from '@/components/chores/EditChoreModal'
import type { AddChoreRequest } from '@/interfaces/api/chores/AddChoreRequest'
import type { UpdateChoreRequest } from '@/interfaces/api/chores/UpdateChoreRequest'
import type { ChoreItem } from '@/interfaces/api/chores/ChoreItem'
import { choresStyles } from '@/styles/choresStyles'
import { useQuery } from '@tanstack/react-query'
import { authApiClient } from '@/helpers/apiClient'
import { useState } from 'react'
import { TouchableOpacity, useColorScheme, View, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChoresScreen() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']
  const isDark = colorScheme === 'dark'

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingChore, setEditingChore] = useState<ChoreItem | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.Chores],
    queryFn: async () => {
      const res = await authApiClient.get<{ chores: ChoreItem[] }>(
        '/api/chores/GetChores'
      )
      return res.data
    },
  })

  const chores = data?.chores ?? []

  const addChore = useMutationPost<AddChoreRequest, void>({
    url: '/api/chores/AddChore',
    queryKey: [QueryKeys.Chores],
    invalidateQuery: true,
    onSuccess: () => {
      setShowAddModal(false)
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to add chore')
    },
  })

  const updateChore = useMutationPut<UpdateChoreRequest, void>({
    url: '/api/chores/UpdateChore',
    queryKey: [QueryKeys.Chores],
    invalidateQuery: true,
    onSuccess: () => {
      setEditingChore(null)
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to update chore')
    },
  })

  const completeChore = useMutationPatch<number, void>({
    url: (choreId: number) => `/api/chores/CompleteChore?choreId=${choreId}`,
    queryKey: [QueryKeys.Chores],
    invalidateQuery: true,
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to complete chore')
    },
  })

  const deleteChore = useMutationDelete<number, void>({
    url: (choreId: number) => `/api/chores/DeleteChore?choreId=${choreId}`,
    queryKey: [QueryKeys.Chores],
    invalidateQuery: true,
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to delete chore')
    },
  })

  const handleDelete = (choreId: number) => {
    Alert.alert('Delete Chore', 'Are you sure you want to delete this chore?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteChore.mutate(choreId) },
    ])
  }

  const overdue = chores.filter((c) => isOverdue(c.nextDueDate))
  const upcoming = chores.filter((c) => !isOverdue(c.nextDueDate))

  return (
    <SafeAreaView style={[choresStyles.screenContainer, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View
        style={[
          choresStyles.screenHeader,
          {
            backgroundColor: isDark ? '#1D2026' : '#ffffff',
            borderBottomColor: isDark ? '#2F333B' : '#e5e7eb',
          },
        ]}
      >
        <ThemedText type="title" style={choresStyles.screenHeaderTitle}>
          Chores
        </ThemedText>
        <View style={choresStyles.screenHeaderActions}>
          <TouchableOpacity
            style={[choresStyles.screenHeaderButton, { backgroundColor: '#0a7ea4' }]}
            onPress={() => setShowAddModal(true)}
          >
            <IconSymbol name="plus" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chores List */}
      <ScrollView
        style={choresStyles.screenContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <ChoresList
          overdue={overdue}
          upcoming={upcoming}
          isLoading={isLoading}
          onComplete={(id) => completeChore.mutate(id)}
          onEdit={(chore) => setEditingChore(chore)}
          onDelete={handleDelete}
          onAdd={() => setShowAddModal(true)}
          isDark={isDark}
        />
      </ScrollView>

      {/* Modals */}
      <AddChoreModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(name, description, frequency, nextDueDate, customFrequencyDays) =>
          addChore.mutate({ name, description, frequency, nextDueDate, customFrequencyDays })
        }
        isDark={isDark}
      />

      <EditChoreModal
        visible={editingChore !== null}
        chore={editingChore}
        onClose={() => setEditingChore(null)}
        onSubmit={(id, name, description, frequency, nextDueDate, customFrequencyDays) =>
          updateChore.mutate({ id, name, description, frequency, nextDueDate, customFrequencyDays })
        }
        isDark={isDark}
      />
    </SafeAreaView>
  )
}
