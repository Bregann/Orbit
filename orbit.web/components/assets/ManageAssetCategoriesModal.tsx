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
  ActionIcon,
  Textarea
} from '@mantine/core'
import { useState } from 'react'
import { IconPlus, IconX, IconCheck } from '@tabler/icons-react'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import type { AssetCategoryItem } from '@/interfaces/api/assets/GetAllAssetCategoriesDto'
import type { AssetItem } from '@/interfaces/api/assets/GetAllAssetsDto'
import type { AddAssetCategoryRequest } from '@/interfaces/api/assets/AddAssetCategoryRequest'
import { QueryKeys } from '@/helpers/QueryKeys'

interface ManageAssetCategoriesModalProps {
  opened: boolean
  onClose: () => void
  categories: AssetCategoryItem[]
  assets: AssetItem[]
  onCategoryDeleted?: () => void
}

export default function ManageAssetCategoriesModal({
  opened,
  onClose,
  categories,
  assets: _assets,
  onCategoryDeleted
}: ManageAssetCategoriesModalProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  const { mutateAsync: addCategory, isPending: isAddingCategory } = useMutationPost<AddAssetCategoryRequest, void>({
    url: '/api/assets/AddAssetCategory',
    queryKey: [QueryKeys.AssetCategories],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Category added successfully', 3000, <IconCheck />)
      setNewCategoryName('')
      setNewCategoryDescription('')
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add category', 3000, <IconX />)
    }
  })

  const { mutateAsync: deleteCategory, isPending: isDeletingCategory } = useMutationDelete<number, void>({
    url: (categoryId) => `/api/assets/DeleteAssetCategory?categoryId=${categoryId}`,
    queryKey: [QueryKeys.AssetCategories],
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
    if (!newCategoryName.trim()) {
      notificationHelper.showErrorNotification('Error', 'Please enter a category name', 3000, <IconX />)
      return
    }

    const request: AddAssetCategoryRequest = {
      categoryName: newCategoryName.trim(),
      description: newCategoryDescription.trim() || null
    }

    await addCategory(request)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Manage Asset Categories"
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Category Name"
          placeholder="e.g., Laptops, Phones, Tablets"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleAddCategory()
          }}
        />
        <Textarea
          label="Description (Optional)"
          placeholder="Brief description of this category..."
          value={newCategoryDescription}
          onChange={(e) => setNewCategoryDescription(e.currentTarget.value)}
          minRows={2}
        />
        <Button
          onClick={handleAddCategory}
          leftSection={<IconPlus size="1rem" />}
          loading={isAddingCategory}
          fullWidth
        >
          Add Category
        </Button>

        <Divider />

        <Stack gap="xs">
          <Text size="sm" fw={500}>Existing Categories</Text>
          {categories.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No categories yet. Add one above!
            </Text>
          ) : (
            categories.map(category => (
              <Card key={category.categoryId} withBorder p="md" radius="sm">
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb="xs">
                      <Text size="sm" fw={500}>{category.categoryName}</Text>
                      <Text size="xs" c="dimmed">({category.assetCount} assets)</Text>
                    </Group>
                    {category.description && (
                      <Text size="xs" c="dimmed" lineClamp={2}>{category.description}</Text>
                    )}
                  </div>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={async () => await deleteCategory(category.categoryId)}
                    disabled={isDeletingCategory}
                    title={category.assetCount > 0 ? 'Cannot delete category with assets' : 'Delete category'}
                  >
                    <IconX size="1rem" />
                  </ActionIcon>
                </Group>
              </Card>
            ))
          )}
        </Stack>

        <Text size="xs" c="dimmed">
          Note: Categories with assets cannot be deleted. Please reassign or delete the assets first.
        </Text>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
