'use client'

import { Modal, Stack, TextInput, Button, Group, ColorPicker, Text } from '@mantine/core'
import { useState } from 'react'
import { AddCalendarEventTypeRequest } from '@/interfaces/api/calendar/AddCalendarEventTypeRequest'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import { QueryKeys } from '@/helpers/QueryKeys'

interface AddEventTypeModalProps {
  opened: boolean
  onClose: () => void
}

const colorSwatches = [
  '#ef4444', // red
  '#ec4899', // pink
  '#a855f7', // purple
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#10b981', // green
  '#84cc16', // lime
  '#eab308', // yellow
  '#f97316', // orange
]

export default function AddEventTypeModal({ opened, onClose }: AddEventTypeModalProps) {
  const [label, setLabel] = useState('')
  const [selectedColour, setSelectedColour] = useState<string>('#3b82f6')

  const addEventTypeMutation = useMutationPost<AddCalendarEventTypeRequest, void>({
    url: '/api/calendar/AddCalendarEventType',
    queryKey: [QueryKeys.CalendarEventTypes],
    invalidateQuery: true
  })

  const handleAdd = async () => {
    if (!label.trim()) return

    const request: AddCalendarEventTypeRequest = {
      eventTypeName: label.trim(),
      hexColourCode: selectedColour
    }

    await addEventTypeMutation.mutateAsync(request)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setLabel('')
    setSelectedColour('#3b82f6')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add Event Type"
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Event Type Name"
          placeholder="e.g., Gym Session, Book Club, etc."
          value={label}
          onChange={(e) => setLabel(e.currentTarget.value)}
          required
        />

        <div>
          <Text size="sm" fw={500} mb="xs">Color</Text>
          <ColorPicker
            format="hex"
            value={selectedColour}
            onChange={setSelectedColour}
            swatches={colorSwatches}
            swatchesPerRow={6}
            fullWidth
          />
          <Group gap="xs" mt="xs" align="center">
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '4px',
                backgroundColor: selectedColour,
                border: '1px solid var(--mantine-color-dark-4)',
              }}
            />
            <Text size="xs" c="dimmed">{selectedColour}</Text>
          </Group>
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!label.trim()}>
            Add Event Type
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
