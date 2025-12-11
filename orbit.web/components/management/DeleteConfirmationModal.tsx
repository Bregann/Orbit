'use client'

import { Modal, Stack, Alert, Group, Button, ThemeIcon, Text } from '@mantine/core'
import { IconAlertCircle, IconTrash } from '@tabler/icons-react'

interface DeleteConfirmationModalProps {
  opened: boolean
  onClose: () => void
  onConfirm: () => void
  deleteType: 'pot' | 'transaction' | 'payment' | 'document'
  itemName?: string
}

export default function DeleteConfirmationModal({
  opened,
  onClose,
  onConfirm,
  deleteType,
  itemName
}: DeleteConfirmationModalProps) {
  const defaultItemName = deleteType === 'pot'
    ? 'pot'
    : deleteType === 'transaction'
      ? 'automatic transaction rule'
      : deleteType === 'payment'
        ? 'subscription'
        : 'document'

  const displayName = itemName || defaultItemName

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" color="red" variant="light">
            <IconAlertCircle size="1.2rem" />
          </ThemeIcon>
          <Text fw={600}>Confirm Deletion</Text>
        </Group>
      }
      centered
      size="md"
    >
      <Stack gap="lg">
        <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
          <Text size="sm">
            Are you sure you want to delete this {displayName}?
            This action cannot be undone.
          </Text>
        </Alert>
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size="1rem" />}
            onClick={onConfirm}
          >
            Yes, Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
