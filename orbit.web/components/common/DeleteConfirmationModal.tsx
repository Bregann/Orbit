'use client'

import { Modal, Stack, Text, Group, Button } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'

interface DeleteConfirmationModalProps {
  opened: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isDeleting?: boolean
}

export default function DeleteConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <Stack gap="md">
        <Group gap="sm">
          <IconAlertTriangle size="1.5rem" color="var(--mantine-color-red-6)" />
          <Text size="sm">{message}</Text>
        </Group>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm} loading={isDeleting} disabled={isDeleting}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
