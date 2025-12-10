'use client'

import {
  Modal,
  Stack,
  Button,
  Text,
  Group
} from '@mantine/core'

interface RecurringActionModalProps {
  opened: boolean
  onClose: () => void
  actionType: 'delete' | 'edit'
  onActionSingle: () => void
  onActionSeries: () => void
}

export default function RecurringActionModal({
  opened,
  onClose,
  actionType,
  onActionSingle,
  onActionSeries
}: RecurringActionModalProps) {
  const isDelete = actionType === 'delete'

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isDelete ? 'Delete Recurring Event' : 'Edit Recurring Event'}
      size="md"
    >
      <Stack gap="md">
        <Text>
          This is a recurring event. Would you like to {isDelete ? 'delete' : 'edit'} only this occurrence or all occurrences in the series?
        </Text>

        <Stack gap="xs">
          <Button
            variant="light"
            onClick={() => {
              onActionSingle()
              onClose()
            }}
            fullWidth
          >
            Only this event
          </Button>
          <Button
            variant="light"
            color={isDelete ? 'red' : 'blue'}
            onClick={() => {
              onActionSeries()
              onClose()
            }}
            fullWidth
          >
            All events in the series
          </Button>
        </Stack>

        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
