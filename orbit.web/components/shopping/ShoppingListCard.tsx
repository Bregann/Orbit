'use client'

import {
  Card,
  Group,
  Title,
  Button,
  Stack,
  Badge,
  Checkbox,
  ActionIcon,
  Divider,
  ThemeIcon,
  Text
} from '@mantine/core'
import { useState } from 'react'
import { IconTrash, IconShoppingCart, IconCheck, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPut } from '@/helpers/mutations/useMutationPut'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import type { GetShoppingListItemsResponse, ShoppingListItem } from '@/interfaces/api/shopping/GetShoppingListItemsResponse'

export default function ShoppingListCard() {
  const [showChecked, setShowChecked] = useState(true)

  const { data: itemsData } = useQuery({
    queryKey: ['shoppingListItems'],
    queryFn: async () => await doQueryGet<GetShoppingListItemsResponse>('/api/shopping/GetShoppingListItems')
  })

  const items = itemsData?.items ?? []

  const { mutate: deleteItem } = useMutationDelete<number, void>({
    url: (itemId) => `/api/shopping/RemoveShoppingListItem?itemId=${itemId}`,
    queryKey: ['shoppingListItems'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Item removed', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to remove item', 3000, <IconX />)
    }
  })

  const { mutate: clearPurchased, isPending: isClearingPurchased } = useMutationDelete<void, void>({
    url: '/api/shopping/ClearPurchasedShoppingListItems',
    queryKey: ['shoppingListItems'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Purchased items cleared', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to clear items', 3000, <IconX />)
    }
  })

  const { mutate: markAsPurchased } = useMutationPut<number, void>({
    url: (itemId) => `/api/shopping/MarkShoppingListItemAsPurchased?itemId=${itemId}`,
    queryKey: ['shoppingListItems'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Item marked as purchased', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to update item', 3000, <IconX />)
    }
  })

  const toggleItemChecked = (item: ShoppingListItem) => {
    markAsPurchased(item.id)
  }

  const filteredItems = items.filter(item => showChecked || !item.isPurchased)
  const checkedCount = items.filter(i => i.isPurchased).length

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon size="lg" radius="md" variant="light" color="orange">
            <IconShoppingCart size="1.2rem" />
          </ThemeIcon>
          <Title order={3} size="h4">Shopping List</Title>
        </Group>
        <Group gap="md">
          <Checkbox
            label="Show checked"
            checked={showChecked}
            onChange={(e) => setShowChecked(e.currentTarget.checked)}
          />
          <Badge variant="light">{filteredItems.length} items</Badge>
          {checkedCount > 0 && (
            <Button
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconTrash size="1rem" />}
              onClick={() => clearPurchased()}
              loading={isClearingPurchased}
            >
              Clear Checked ({checkedCount})
            </Button>
          )}
        </Group>
      </Group>

      <Divider mb="md" />

      {filteredItems.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {items.length === 0
            ? 'Your list is empty. Add some items to get started!'
            : 'All items are checked off. Nice work!'}
        </Text>
      ) : (
        <Stack gap="xs">
          {filteredItems.map(item => (
            <Card
              key={item.id}
              withBorder
              p="sm"
              radius="sm"
              style={{ opacity: item.isPurchased ? 0.6 : 1, cursor: 'pointer' }}
              onClick={() => toggleItemChecked(item)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                  <Checkbox
                    checked={item.isPurchased}
                    onChange={() => toggleItemChecked(item)}
                    size="md"
                  />
                  <Text
                    size="sm"
                    fw={500}
                    td={item.isPurchased ? 'line-through' : undefined}
                  >
                    {item.name}
                  </Text>
                </Group>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                >
                  <IconTrash size="1rem" />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Card>
  )
}

export function useShoppingListItems() {
  const { data: itemsData } = useQuery({
    queryKey: ['shoppingListItems'],
    queryFn: async () => await doQueryGet<GetShoppingListItemsResponse>('/api/shopping/GetShoppingListItems')
  })

  return itemsData?.items ?? []
}
