'use client'

import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Grid,
  Select,
  Group,
  Button
} from '@mantine/core'
import { useState } from 'react'
import { IconCheck, IconX } from '@tabler/icons-react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import type { AddTaskRequest } from '@/interfaces/api/tasks/AddTaskRequest'
import { TaskPriorityType } from '@/interfaces/api/tasks/TaskPriorityType'
import { QueryKeys } from '@/helpers/QueryKeys'

const priorities = [
  { value: TaskPriorityType.Low.toString(), label: 'Low' },
  { value: TaskPriorityType.Medium.toString(), label: 'Medium' },
  { value: TaskPriorityType.High.toString(), label: 'High' },
  { value: TaskPriorityType.Critical.toString(), label: 'Critical' },
]

interface AddTaskModalProps {
  opened: boolean
  onClose: () => void
  categories: { id: number; name: string }[]
}

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const dateOptions = [
  { value: 'today', label: 'Today' },
  { value: 'none', label: 'No date' },
  { value: 'custom', label: 'Custom date' },
]

export default function AddTaskModal({ opened, onClose, categories }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<string | null>(TaskPriorityType.Medium.toString())
  const [category, setCategory] = useState<string | null>(null)
  const [dateOption, setDateOption] = useState<string | null>('none')
  const [customDate, setCustomDate] = useState('')

  const isFormValid = title.trim() !== '' && category !== null

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority(TaskPriorityType.Medium.toString())
    setCategory(null)
    setDateOption('none')
    setCustomDate('')
  }

  const { mutateAsync: addTask, isPending } = useMutationPost<AddTaskRequest, number>({
    url: '/api/tasks/AddNewTask',
    queryKey: [QueryKeys.Tasks],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Task added successfully', 3000, <IconCheck />)
      onClose()
      resetForm()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add task', 3000, <IconX />)
    }
  })

  const handleSubmit = async () => {
    if (!isFormValid) return

    let dueDate: string | null = null
    if (dateOption === 'today') {
      dueDate = getTodayDate()
    } else if (dateOption === 'custom' && customDate) {
      dueDate = customDate
    }

    const request: AddTaskRequest = {
      title: title.trim(),
      description: description.trim(),
      taskCategoryId: parseInt(category!),
      priority: parseInt(priority ?? TaskPriorityType.Medium.toString()) as TaskPriorityType,
      dueDate
    }

    await addTask(request)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Task"
      size="md"
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        <TextInput
          label="Task Title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Description"
          placeholder="Enter task description (optional)"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          rows={3}
        />
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Priority"
              placeholder="Select priority"
              data={priorities}
              value={priority}
              onChange={setPriority}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Category"
              placeholder="Select category"
              data={categories.map(c => ({ value: c.id.toString(), label: c.name }))}
              value={category}
              onChange={setCategory}
              required
            />
          </Grid.Col>
        </Grid>
        <Select
          label="Due Date"
          placeholder="Select due date option"
          data={dateOptions}
          value={dateOption}
          onChange={setDateOption}
        />
        {dateOption === 'custom' && (
          <TextInput
            label="Select Date"
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.currentTarget.value)}
          />
        )}
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isPending} disabled={!isFormValid}>Add Task</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
