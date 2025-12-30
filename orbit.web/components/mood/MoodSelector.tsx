'use client'

import { Card, Group, Text, ThemeIcon, Modal, Button, Stack, Alert } from '@mantine/core'
import {
  IconMoodCrazyHappy,
  IconMoodHappy,
  IconMoodEmpty,
  IconMoodSad,
  IconMoodConfuzed
} from '@tabler/icons-react'
import { useState } from 'react'
import { MoodType } from '@/interfaces/api/mood/MoodType'
import { RecordMoodRequest } from '@/interfaces/api/mood/RecordMoodRequest'
import { notifications } from '@mantine/notifications'
import { QueryKeys } from '@/helpers/QueryKeys'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import { IconCheck, IconAlertCircle } from '@tabler/icons-react'

interface MoodOption {
  type: MoodType
  label: string
  icon: React.ComponentType<{ size?: string | number }>
  color: string
}

const moodOptions: MoodOption[] = [
  { type: MoodType.Excellent, label: 'Excellent', icon: IconMoodCrazyHappy, color: 'green' },
  { type: MoodType.Good, label: 'Good', icon: IconMoodHappy, color: 'teal' },
  { type: MoodType.Neutral, label: 'Neutral', icon: IconMoodEmpty, color: 'yellow' },
  { type: MoodType.Low, label: 'Low', icon: IconMoodSad, color: 'orange' },
  { type: MoodType.Difficult, label: 'Difficult', icon: IconMoodConfuzed, color: 'red' }
]

interface MoodSelectorProps {
  currentMood?: MoodType | null
  hasMoodToday: boolean
}

export default function MoodSelector({ currentMood, hasMoodToday }: MoodSelectorProps) {
  const [confirmModalOpened, setConfirmModalOpened] = useState(false)
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)

  const { mutate: recordMood, isPending } = useMutationPost<RecordMoodRequest, void>({
    url: '/api/Mood/RecordMood',
    queryKey: [QueryKeys.TodaysMood],
    invalidateQuery: true,
    onSuccess: () => {
      notifications.show({
        title: 'Mood Recorded',
        message: 'Your mood has been recorded successfully',
        color: 'green',
        icon: <IconCheck size="1rem" />
      })
      setConfirmModalOpened(false)
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to record mood',
        color: 'red'
      })
    }
  })

  const handleMoodClick = (mood: MoodType) => {
    setSelectedMood(mood)
    setConfirmModalOpened(true)
  }

  const handleConfirm = () => {
    if (selectedMood !== null) {
      recordMood({ mood: selectedMood })
    }
  }

  const getSelectedMoodOption = () => {
    return moodOptions.find(option => option.type === selectedMood)
  }

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          {!hasMoodToday && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Mood Not Recorded" color="yellow">
              You haven't recorded your mood today. Take a moment to check in!
            </Alert>
          )}

          <Group justify="space-between">
            <Text size="lg" fw={600}>How are you feeling today?</Text>
            {hasMoodToday && currentMood && (
              <Text size="xs" c="dimmed">Already recorded</Text>
            )}
          </Group>

          <Group justify="center" gap="md">
            {moodOptions.map((mood) => {
              const Icon = mood.icon
              const isSelected = currentMood === mood.type
              const isDisabled = hasMoodToday && currentMood !== mood.type

              return (
                <ThemeIcon
                  key={mood.type}
                  size={60}
                  radius="xl"
                  color={mood.color}
                  variant={isSelected ? 'filled' : 'light'}
                  style={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => !isDisabled && handleMoodClick(mood.type)}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.transform = 'scale(1.15)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.transform = 'scale(1)'
                    }
                  }}
                >
                  <Icon size="2rem" />
                </ThemeIcon>
              )
            })}
          </Group>

          <Group justify="center" gap="md">
            {moodOptions.map((mood) => (
              <Text
                key={`label-${mood.type}`}
                size="xs"
                c="dimmed"
                style={{ width: '60px', textAlign: 'center' }}
              >
                {mood.label}
              </Text>
            ))}
          </Group>
        </Stack>
      </Card>

      <Modal
        opened={confirmModalOpened}
        onClose={() => setConfirmModalOpened(false)}
        title="Confirm Your Mood"
        centered
      >
        <Stack gap="md">
          {selectedMood !== null && getSelectedMoodOption() && (
            <>
              <Group justify="center">
                <ThemeIcon
                  size={80}
                  radius="xl"
                  color={getSelectedMoodOption()!.color}
                  variant="light"
                >
                  {(() => {
                    const Icon = getSelectedMoodOption()!.icon
                    return <Icon size="3rem" />
                  })()}
                </ThemeIcon>
              </Group>
              <Text ta="center" size="lg">
                You're feeling <strong>{getSelectedMoodOption()!.label.toLowerCase()}</strong> today?
              </Text>
            </>
          )}

          <Group justify="space-between" mt="md">
            <Button
              variant="subtle"
              onClick={() => setConfirmModalOpened(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              loading={isPending}
              color={getSelectedMoodOption()?.color}
            >
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
