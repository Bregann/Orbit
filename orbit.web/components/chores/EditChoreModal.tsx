'use client'

import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  SegmentedControl,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { useMutationPut } from '@/helpers/mutations/useMutationPut'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { ChoreItem } from '@/interfaces/api/chores/ChoreItem'
import { ChoreFrequencyType } from '@/interfaces/api/chores/ChoreFrequencyType'
import { QueryKeys } from '@/helpers/QueryKeys'

interface EditChoreModalProps {
  opened: boolean
  chore: ChoreItem | null
  onClose: () => void
}

export default function EditChoreModal({ opened, chore, onClose }: EditChoreModalProps) {
  const todayStr = new Date().toISOString().split('T')[0]
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<string>('2')
  const [customDays, setCustomDays] = useState('')
  const [dueDate, setDueDate] = useState<string | null>(null)

  useEffect(() => {
    if (chore !== null) {
      setName(chore.name)
      setDescription(chore.description)
      setFrequency(chore.frequency.toString())
      setCustomDays(chore.customFrequencyDays?.toString() ?? '')
      setDueDate(new Date(chore.nextDueDate).toISOString().split('T')[0])
    }
  }, [chore])

  const { mutate, isPending } = useMutationPut<{
    id: number
    name: string
    description: string
    frequency: ChoreFrequencyType
    nextDueDate: string
    customFrequencyDays: number | null
  }, void>({
    url: '/api/chores/UpdateChore',
    queryKey: [QueryKeys.Chores],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Chore updated successfully', 3000, <IconCheck />)
      onClose()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to update chore', 3000, <IconX />)
    }
  })

  const handleSubmit = () => {
    if (!chore || !name.trim() || !dueDate) {
      return
    }

    const freq = parseInt(frequency) as ChoreFrequencyType
    const days = freq === ChoreFrequencyType.Custom ? (parseInt(customDays) || null) : null

    mutate({
      id: chore.id,
      name: name.trim(),
      description: description.trim(),
      frequency: freq,
      nextDueDate: new Date(dueDate + 'T00:00:00Z').toISOString(),
      customFrequencyDays: days
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Chore"
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
          label="Next Due Date"
          type="date"
          value={dueDate ?? ''}
          onChange={(e) => setDueDate(e.currentTarget.value)}
          required
          min={todayStr}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            disabled={!name.trim() || !dueDate}
          >
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
