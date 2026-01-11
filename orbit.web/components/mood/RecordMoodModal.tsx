'use client'

import { Modal, Stack, Button, Group, Text, ThemeIcon } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { MoodType } from '@/interfaces/api/mood/MoodType'
import { RecordMoodForDateRequest } from '@/interfaces/api/mood/RecordMoodForDateRequest'
import { notifications } from '@mantine/notifications'
import { QueryKeys } from '@/helpers/QueryKeys'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import { moodOptions } from '@/helpers/moodOptions'
import { formatFullDate } from '@/helpers/dateHelper'

interface RecordMoodModalProps {
  opened: boolean
  onClose: () => void
  date: string
  currentMood?: MoodType | null
}

export default function RecordMoodModal({ opened, onClose, date, currentMood }: RecordMoodModalProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(currentMood || null)

  // Reset selectedMood when modal opens with new data
  useEffect(() => {
    if (opened) {
      setSelectedMood(currentMood || null)
    }
  }, [opened, currentMood])

  const { mutate: recordMood, isPending } = useMutationPost<RecordMoodForDateRequest, void>({
    url: '/api/Mood/RecordMoodForDate',
    queryKey: [QueryKeys.YearlyMoodData],
    invalidateQuery: true,
    onSuccess: () => {
      notifications.show({
        title: 'Mood Recorded',
        message: 'Your mood has been recorded successfully',
        color: 'green',
        icon: <IconCheck size="1rem" />
      })
      onClose()
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to record mood',
        color: 'red'
      })
    }
  })

  const handleSave = () => {
    if (selectedMood !== null) {
      recordMood({ mood: selectedMood, date })
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Record Mood for {formatFullDate(date)}</Text>}
      centered
      size="md"
    >
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          {currentMood ? 'Update your mood for this day' : 'How were you feeling on this day?'}
        </Text>

        <Group justify="center" gap="md">
          {moodOptions.map((mood) => {
            const Icon = mood.icon
            const isSelected = selectedMood === mood.type
            return (
              <Stack
                key={mood.type}
                gap={4}
                align="center"
                style={{ cursor: 'pointer', opacity: isSelected ? 1 : 0.6 }}
                onClick={() => setSelectedMood(mood.type)}
              >
                <ThemeIcon
                  size={60}
                  radius="xl"
                  variant={isSelected ? 'filled' : 'light'}
                  color={mood.color}
                  style={{
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={32} />
                </ThemeIcon>
                <Text size="xs" fw={isSelected ? 600 : 400}>
                  {mood.label}
                </Text>
              </Stack>
            )
          })}
        </Group>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedMood === null}
            loading={isPending}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
