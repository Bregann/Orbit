'use client'

import {
  Modal,
  Stack,
  Group,
  TextInput,
  Button,
  Divider,
  Text,
  Card,
  Badge,
  ActionIcon
} from '@mantine/core'
import { useState } from 'react'
import { IconPlus, IconX, IconCheck } from '@tabler/icons-react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import type { AddNewCategoryRequest } from '@/interfaces/api/tasks/AddNewCategoryRequest'
import type { TaskCategoryItem } from '@/interfaces/api/tasks/TaskCategoryItem'
import type { TaskItem } from '@/interfaces/api/tasks/TaskItem'

interface ManageCategoriesModalProps {
  opened: boolean
  onClose: () => void
  categories: TaskCategoryItem[]
  tasks: TaskItem[]
  onCategoryDeleted?: () => void
}

export default function ManageCategoriesModal({
  opened,
  onClose,
  categories,
  tasks,
  onCategoryDeleted
}: ManageCategoriesModalProps) {
  const [newCategoryName, setNewCategoryName] = useState('')

  const { mutateAsync: addCategory, isPending: isAddingCategory } = useMutationPost<AddNewCategoryRequest, number>({
    url: '/api/tasks/AddNewCategory',
    queryKey: ['taskCategories'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Category added successfully', 3000, <IconCheck />)
      setNewCategoryName('')
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add category', 3000, <IconX />)
    }
  })

  const { mutateAsync: deleteCategory, isPending: isDeletingCategory } = useMutationDelete<number, void>({
    url: (categoryId) => `/api/tasks/DeleteCategory?categoryId=${categoryId}`,
    queryKey: ['taskCategories'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Category deleted successfully', 3000, <IconCheck />)
      onCategoryDeleted?.()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete category', 3000, <IconX />)
    }
  })

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    const request: AddNewCategoryRequest = {
      name: newCategoryName.trim()
    }

    await addCategory(request)
  }

  const handleDeleteCategory = async (categoryId: number) => {
    const tasksUsingCategory = tasks.filter(t => t.taskCategoryId === categoryId)
    if (tasksUsingCategory.length > 0) {
      notificationHelper.showErrorNotification('Error', 'Cannot delete category with tasks. Remove or reassign tasks first.', 3000, <IconX />)
      return
    }
    await deleteCategory(categoryId)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Manage Categories"
      size="md"
    >
      <Stack gap="md">
        <Group gap="xs">
          <TextInput
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.currentTarget.value)}
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCategory()
            }}
          />
          <Button onClick={handleAddCategory} leftSection={<IconPlus size="1rem" />} loading={isAddingCategory}>
            Add
          </Button>
        </Group>

        <Divider />

        <Stack gap="xs">
          {categories.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No categories yet. Add one above!
            </Text>
          ) : (
            categories.map(category => {
              const taskCount = tasks.filter(t => t.taskCategoryId === category.id).length
              return (
                <Card key={category.id} withBorder p="xs" radius="sm">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Text size="sm" fw={500}>{category.name}</Text>
                      <Badge size="xs" variant="light">
                        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                      </Badge>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={taskCount > 0 || isDeletingCategory}
                      title={taskCount > 0 ? 'Cannot delete category with tasks' : 'Delete category'}
                    >
                      <IconX size="1rem" />
                    </ActionIcon>
                  </Group>
                </Card>
              )
            })
          )}
        </Stack>

        <Text size="xs" c="dimmed">
          Note: Categories with tasks cannot be deleted. Remove or reassign tasks first.
        </Text>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
