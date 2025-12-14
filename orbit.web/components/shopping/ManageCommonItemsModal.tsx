'use client'

import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  Card,
  Text,
  ActionIcon,
  Divider
} from '@mantine/core'
import { useState } from 'react'
import { IconPlus, IconX, IconCheck } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import type { GetShoppingListQuickAddItemsResponse } from '@/interfaces/api/shopping/GetShoppingListQuickAddItemsResponse'

interface ManageCommonItemsModalProps {
  opened: boolean
  onClose: () => void
}

export default function ManageCommonItemsModal({ opened, onClose }: ManageCommonItemsModalProps) {
  const [newCommonItem, setNewCommonItem] = useState('')

  const { data: quickAddData } = useQuery({
    queryKey: ['shoppingListQuickAddItems'],
    queryFn: async () => await doQueryGet<GetShoppingListQuickAddItemsResponse>('/api/shopping/GetShoppingListQuickAddItems')
  })

  const commonItems = quickAddData?.items ?? []

  const { mutate: removeCommonItem } = useMutationDelete<number, void>({
    url: (itemId) => `/api/shopping/RemoveShoppingListQuickAddItem?itemId=${itemId}`,
    queryKey: ['shoppingListQuickAddItems'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Common item removed', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to remove common item', 3000, <IconX />)
    }
  })

  const { mutate: addCommonItem } = useMutationPost<string, void>({
    url: (name) => `/api/shopping/AddShoppingListQuickAddItem?name=${encodeURIComponent(name)}`,
    queryKey: ['shoppingListQuickAddItems'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Common item added', 3000, <IconCheck />)
      setNewCommonItem('')
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add common item', 3000, <IconX />)
    }
  })

  const handleAddCommonItem = async () => {
    if (!newCommonItem.trim()) return
    if (commonItems.some(item => item.name.toLowerCase() === newCommonItem.trim().toLowerCase())) {
      notificationHelper.showErrorNotification('Duplicate', 'This item already exists', 3000, <IconX />)
      return
    }

    addCommonItem(newCommonItem.trim())
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Manage Common Items"
      size="md"
    >
      <Stack gap="md">
        <Group gap="xs">
          <TextInput
            placeholder="Add common item..."
            value={newCommonItem}
            onChange={(e) => setNewCommonItem(e.currentTarget.value)}
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCommonItem()
            }}
          />
          <Button
            onClick={handleAddCommonItem}
            leftSection={<IconPlus size="1rem" />}
            disabled={!newCommonItem.trim()}
          >
            Add
          </Button>
        </Group>

        <Divider />

        <Stack gap="xs">
          {commonItems.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No common items yet. Add some above!
            </Text>
          ) : (
            commonItems.map(item => (
              <Card key={item.id} withBorder p="xs" radius="sm">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>{item.name}</Text>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => removeCommonItem(item.id)}
                  >
                    <IconX size="1rem" />
                  </ActionIcon>
                </Group>
              </Card>
            ))
          )}
        </Stack>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
