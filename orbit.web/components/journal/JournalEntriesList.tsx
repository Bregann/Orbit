'use client'

import { Card, Stack, Title, Badge, Divider, ThemeIcon, Group, Text, ActionIcon } from '@mantine/core'
import { IconBook, IconTrash } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconMoodCrazyHappy,
  IconMoodHappy,
  IconMoodEmpty,
  IconMoodSad,
  IconMoodSmile
} from '@tabler/icons-react'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal'
import type { JournalEntry } from '@/interfaces/api/journal/GetJournalEntriesResponse'
import { JournalMoodEnum } from '@/interfaces/api/journal/JournalMoodEnum'

interface JournalEntriesListProps {
  entries: JournalEntry[]
  onEntryClick: (_entry: JournalEntry) => void
}

const moods = [
  { value: JournalMoodEnum.Great, label: 'Great', icon: IconMoodCrazyHappy, color: 'green' },
  { value: JournalMoodEnum.Good, label: 'Good', icon: IconMoodHappy, color: 'teal' },
  { value: JournalMoodEnum.Neutral, label: 'Neutral', icon: IconMoodEmpty, color: 'gray' },
  { value: JournalMoodEnum.Bad, label: 'Bad', icon: IconMoodSad, color: 'orange' },
  { value: JournalMoodEnum.Awful, label: 'Awful', icon: IconMoodSmile, color: 'red' },
]

export default function JournalEntriesList({ entries, onEntryClick }: JournalEntriesListProps) {
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null)

  const { mutate: deleteEntry } = useMutationDelete<number, void>({
    url: (entryId) => `/api/journal/DeleteJournalEntry?id=${entryId}`,
    queryKey: ['journalEntries'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Journal entry deleted', 3000, <IconCheck />)
      closeDeleteModal()
      setEntryToDelete(null)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete entry', 3000, <IconX />)
    }
  })

  const handleDeleteClick = (entry: JournalEntry) => {
    setEntryToDelete(entry)
    openDeleteModal()
  }

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete.id)
    }
  }

  const getMoodIcon = (mood: JournalMoodEnum) => {
    const moodData = moods.find(m => m.value === mood)
    if (!moodData) return <IconMoodEmpty size="1rem" />
    const IconComponent = moodData.icon
    return <IconComponent size="1rem" />
  }

  const getMoodColor = (mood: JournalMoodEnum) => {
    const moodData = moods.find(m => m.value === mood)
    return moodData?.color || 'gray'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, ' ').trim()
  }

  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon size="lg" radius="md" variant="light" color="pink">
            <IconBook size="1.2rem" />
          </ThemeIcon>
          <Title order={3} size="h4">Journal Entries</Title>
        </Group>
        <Badge variant="light">{entries.length} entries</Badge>
      </Group>

      <Divider mb="md" />

      {entries.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No journal entries yet. Start writing to capture your thoughts!
        </Text>
      ) : (
        <Stack gap="md">
          {sortedEntries.map(entry => (
            <Card
              key={entry.id}
              withBorder
              p="md"
              radius="sm"
              style={{ cursor: 'pointer' }}
              onClick={() => onEntryClick(entry)}
            >
              <Group justify="space-between" mb="xs">
                <Group gap="sm">
                  <ThemeIcon size="sm" radius="xl" variant="light" color={getMoodColor(entry.mood)}>
                    {getMoodIcon(entry.mood)}
                  </ThemeIcon>
                  <Text size="sm" fw={600}>{entry.title}</Text>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    {formatDate(entry.createdAt)}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(entry)
                    }}
                  >
                    <IconTrash size="0.9rem" />
                  </ActionIcon>
                </Group>
              </Group>
              <Text
                size="sm"
                c="dimmed"
                lineClamp={2}
              >
                {stripHtml(entry.content).substring(0, 150)}...
              </Text>
            </Card>
          ))}
        </Stack>
      )}

      <DeleteConfirmationModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        deleteType="journalEntry"
        itemName={entryToDelete?.title}
      />
    </Card>
  )
}

export { moods }
