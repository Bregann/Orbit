'use client'

import { Card, Stack, Title, Badge, Divider, ThemeIcon, Group, Text, ActionIcon } from '@mantine/core'
import { IconBook, IconTrash, IconCheck, IconX } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal'
import type { JournalEntry } from '@/interfaces/api/journal/GetJournalEntriesResponse'
import { QueryKeys } from '@/helpers/QueryKeys'
import { getMoodIcon, getMoodColour } from '@/helpers/moodHelper'
import { formatLongDate } from '@/helpers/dateHelper'

interface JournalEntriesListProps {
  entries: JournalEntry[]
  onEntryClick: (_entry: JournalEntry) => void
}

export default function JournalEntriesList({ entries, onEntryClick }: JournalEntriesListProps) {
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null)

  const { mutate: deleteEntry } = useMutationDelete<number, void>({
    url: (entryId) => `/api/journal/DeleteJournalEntry?id=${entryId}`,
    queryKey: [QueryKeys.JournalEntries],
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
                  <ThemeIcon size="sm" radius="xl" variant="light" color={getMoodColour(entry.mood)}>
                    {getMoodIcon(entry.mood)}
                  </ThemeIcon>
                  <Text size="sm" fw={600}>{entry.title}</Text>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    {formatLongDate(entry.createdAt)}
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
        title="Are You Sure?"
        message={'Do you really want to delete this journal entry? This action cannot be undone.'}
      />
    </Card>
  )
}
