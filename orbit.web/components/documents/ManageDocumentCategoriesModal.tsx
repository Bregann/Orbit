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
  ActionIcon
} from '@mantine/core'
import { useState } from 'react'
import { IconPlus, IconX, IconCheck } from '@tabler/icons-react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import type { DocumentCategoryItem } from '@/interfaces/api/documents/GetAllDocumentCategoriesDto'
import type { DocumentItem } from '@/interfaces/api/documents/GetAllDocumentsDto'
import { QueryKeys } from '@/helpers/QueryKeys'

interface ManageDocumentCategoriesModalProps {
  opened: boolean
  onClose: () => void
  categories: DocumentCategoryItem[]
  documents: DocumentItem[]
  onCategoryDeleted?: () => void
}

export default function ManageDocumentCategoriesModal({
  opened,
  onClose,
  categories,
  documents: _documents,
  onCategoryDeleted
}: ManageDocumentCategoriesModalProps) {
  const [newCategoryName, setNewCategoryName] = useState('')

  const { mutateAsync: addCategory, isPending: isAddingCategory } = useMutationPost<{ categoryName: string }, void>({
    url: `/api/documents/AddDocumentCategory?categoryName=${newCategoryName}`,
    queryKey: [QueryKeys.DocumentCategories],
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
    url: (categoryId) => `/api/documents/DeleteCategory?categoryId=${categoryId}`,
    queryKey: [QueryKeys.DocumentCategories],
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

    await addCategory({ categoryName: newCategoryName.trim() })
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
              // Count documents for this category - backend handles validation
              return (
                <Card key={category.id} withBorder p="xs" radius="sm">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Text size="sm" fw={500}>{category.categoryName}</Text>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={async () => await deleteCategory(category.id)}
                      disabled={isDeletingCategory}
                      title="Delete category"
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
          Note: Categories with documents cannot be deleted. The server will prevent deletion if documents exist.
        </Text>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
