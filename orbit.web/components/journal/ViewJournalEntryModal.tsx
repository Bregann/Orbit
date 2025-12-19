'use client'

import { Modal, Stack, Group, Badge, Divider, Paper, Button, Text } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { JournalEntry } from '@/interfaces/api/journal/GetJournalEntriesResponse'
import { formatLongDate } from '@/helpers/dateHelper'
import { getMoodColour, getMoodIcon, getMoodLabel } from '@/helpers/moodHelper'
import { QueryKeys } from '@/helpers/QueryKeys'

interface ViewJournalEntryModalProps {
  opened: boolean
  onClose: () => void
  entry: JournalEntry | null
}

export default function ViewJournalEntryModal({ opened, onClose, entry }: ViewJournalEntryModalProps) {
  const { mutate: deleteEntry, isPending } = useMutationDelete<number, void>({
    url: (entryId) => `/api/journal/DeleteJournalEntry?id=${entryId}`,
    queryKey: [QueryKeys.JournalEntries],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Journal entry deleted', 3000, <IconCheck />)
      onClose()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete entry', 3000, <IconX />)
    }
  })

  if (!entry) return null

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={entry.title}
      size="lg"
    >
      <Stack gap="md">
        <Group gap="md">
          <Badge
            size="lg"
            variant="light"
            color={getMoodColour(entry.mood)}
            leftSection={getMoodIcon(entry.mood)}
          >
            {getMoodLabel(entry.mood)}
          </Badge>
          <Text size="sm" c="dimmed">
            {formatLongDate(entry.createdAt)}
          </Text>
        </Group>

        <Divider />

        <Paper p="md" withBorder radius="sm">
          <div dangerouslySetInnerHTML={{ __html: entry.content }} />
        </Paper>

        <Group justify="flex-end">
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size="1rem" />}
            onClick={() => deleteEntry(entry.id)}
            loading={isPending}
            disabled={isPending}
          >
            Delete
          </Button>
          <Button variant="light" onClick={onClose} disabled={isPending}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
