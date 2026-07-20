'use client'

import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  SegmentedControl
} from '@mantine/core'
import { useState } from 'react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { AddChoreRequest } from '@/interfaces/api/chores/AddChoreRequest'
import { ChoreFrequencyType } from '@/interfaces/api/chores/ChoreFrequencyType'
import { QueryKeys } from '@/helpers/QueryKeys'

interface AddChoreModalProps {
  opened: boolean
  onClose: () => void
}

export default function AddChoreModal({ opened, onClose }: AddChoreModalProps) {
  const todayStr = new Date().toISOString().split('T')[0]
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<string>('2')
  const [customDays, setCustomDays] = useState('')
  const [dueDate, setDueDate] = useState<string | null>(todayStr)

  const { mutate, isPending } = useMutationPost<AddChoreRequest, void>({
    url: '/api/chores/AddChore',
    queryKey: [QueryKeys.Chores],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Chore added successfully', 3000, <IconCheck />)
      resetForm()
      onClose()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add chore', 3000, <IconX />)
    }
  })

  const resetForm = () => {
    setName('')
    setDescription('')
    setFrequency('2')
    setCustomDays('')
    setDueDate(new Date().toISOString().split('T')[0])
  }

  const handleSubmit = () => {
    if (!name.trim() || !dueDate) {
      return
    }

    const freq = parseInt(frequency) as ChoreFrequencyType
    const days = freq === ChoreFrequencyType.Custom ? (parseInt(customDays) || null) : null

    mutate({
      name: name.trim(),
      description: description.trim(),
      frequency: freq,
      nextDueDate: new Date(dueDate + 'T00:00:00Z').toISOString(),
      customFrequencyDays: days
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add New Chore"
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Chore Name"
          placeholder="e.g. Hoover Living Room"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          data-autofocus
        />

        <Textarea
          label="Description"
          placeholder="e.g. Vacuum the living room carpet and under furniture"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={2}
        />

        <div>
          <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
            Frequency
          </label>
          <SegmentedControl
            fullWidth
            value={frequency}
            onChange={setFrequency}
            data={[
              { label: 'Daily', value: '1' },
              { label: 'Weekly', value: '2' },
              { label: 'Biweekly', value: '3' },
              { label: 'Monthly', value: '4' },
              { label: '6 Monthly', value: '5' },
              { label: 'Custom', value: '6' },
            ]}
          />
        </div>

        {frequency === '6' && (
          <TextInput
            label="Repeat Every (Days)"
            placeholder="e.g. 30"
            value={customDays}
            onChange={(e) => setCustomDays(e.currentTarget.value)}
            type="number"
            min={1}
          />
        )}

        <TextInput
          label="First Due Date"
          type="date"
          value={dueDate ?? ''}
          onChange={(e) => setDueDate(e.currentTarget.value)}
          required
          min={todayStr}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            disabled={!name.trim() || !dueDate}
          >
            Add Chore
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
