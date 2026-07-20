import { ThemedText } from '@/components/themed-text'
import { choresStyles } from '@/styles/choresStyles'
import { ChoreFrequencyType } from '@/interfaces/api/chores/ChoreFrequencyType'
import type { ChoreItem } from '@/interfaces/api/chores/ChoreItem'
import { toUtcDateString } from '@/helpers/dateHelper'
import { FREQUENCIES } from '@/helpers/choreHelper'
import { useEffect, useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'

interface EditChoreModalProps {
  visible: boolean
  chore: ChoreItem | null
  onClose: () => void
  onSubmit: (id: number, name: string, description: string, frequency: ChoreFrequencyType, nextDueDate: string, customFrequencyDays: number | null) => void
  isDark: boolean
}

export function EditChoreModal({ visible, chore, onClose, onSubmit, isDark }: EditChoreModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState(ChoreFrequencyType.Weekly)
  const [customDays, setCustomDays] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (chore !== null) {
      setName(chore.name)
      setDescription(chore.description)
      setFrequency(chore.frequency)
      setCustomDays(chore.customFrequencyDays?.toString() ?? '')
      setDueDate(new Date(chore.nextDueDate).toISOString().split('T')[0])
    }
  }, [chore])

  const handleSubmit = () => {
    if (!chore || !name.trim()) {
      return
    }
    const days = frequency === ChoreFrequencyType.Custom ? (parseInt(customDays) || null) : null
    onSubmit(chore.id, name.trim(), description.trim(), frequency, toUtcDateString(new Date(dueDate + 'T00:00:00Z')), days)
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={choresStyles.modalOverlay}
      >
        <View style={[choresStyles.modalContent, { backgroundColor: isDark ? '#1D2026' : '#ffffff' }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedText style={choresStyles.modalTitle}>Edit Chore</ThemedText>

            <ThemedText style={[choresStyles.modalLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Name
            </ThemedText>
            <TextInput
              style={[
                choresStyles.modalInput,
                {
                  color: isDark ? '#e5e7eb' : '#111827',
                  borderColor: isDark ? '#374151' : '#d1d5db',
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                },
              ]}
              placeholder="e.g. Hoover Living Room"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={name}
              onChangeText={setName}
            />

            <ThemedText style={[choresStyles.modalLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Description
            </ThemedText>
            <TextInput
              style={[
                choresStyles.modalInput,
                choresStyles.modalInputMultiline,
                {
                  color: isDark ? '#e5e7eb' : '#111827',
                  borderColor: isDark ? '#374151' : '#d1d5db',
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                },
              ]}
              placeholder="e.g. Vacuum the living room carpet and under furniture"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <ThemedText style={[choresStyles.modalLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Frequency
            </ThemedText>
            <View style={choresStyles.modalFrequencyRow}>
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    choresStyles.modalFrequencyOption,
                    {
                      borderColor: frequency === f.value ? '#0a7ea4' : isDark ? '#374151' : '#d1d5db',
                      backgroundColor:
                        frequency === f.value ? '#0a7ea420' : isDark ? '#111827' : '#f9fafb',
                    },
                    frequency === f.value && choresStyles.modalFrequencyOptionSelected,
                  ]}
                  onPress={() => setFrequency(f.value)}
                >
                  <ThemedText
                    style={[
                      choresStyles.modalFrequencyOptionText,
                      { color: frequency === f.value ? '#0a7ea4' : isDark ? '#9ca3af' : '#6b7280' },
                    ]}
                  >
                    {f.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {frequency === ChoreFrequencyType.Custom && (
              <>
                <ThemedText style={[choresStyles.modalLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Repeat Every (Days)
                </ThemedText>
                <TextInput
                  style={[
                    choresStyles.modalInput,
                    {
                      color: isDark ? '#e5e7eb' : '#111827',
                      borderColor: isDark ? '#374151' : '#d1d5db',
                      backgroundColor: isDark ? '#111827' : '#f9fafb',
                    },
                  ]}
                  placeholder="e.g. 30"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  value={customDays}
                  onChangeText={setCustomDays}
                  keyboardType="numeric"
                />
              </>
            )}

            <ThemedText style={[choresStyles.modalLabel, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Next Due Date
            </ThemedText>
            <TextInput
              style={[
                choresStyles.modalInput,
                {
                  color: isDark ? '#e5e7eb' : '#111827',
                  borderColor: isDark ? '#374151' : '#d1d5db',
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={dueDate}
              onChangeText={setDueDate}
            />

            <View style={choresStyles.modalActions}>
              <TouchableOpacity
                style={[
                  choresStyles.modalButtonCancel,
                  { backgroundColor: isDark ? '#374151' : '#f3f4f6' },
                ]}
                onPress={handleClose}
              >
                <ThemedText style={[choresStyles.modalButtonCancelText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  choresStyles.modalButtonSubmit,
                  { backgroundColor: name.trim() ? '#0a7ea4' : '#6b7280' },
                ]}
                onPress={handleSubmit}
                disabled={!name.trim()}
              >
                <ThemedText style={choresStyles.modalButtonSubmitText}>Save Changes</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
