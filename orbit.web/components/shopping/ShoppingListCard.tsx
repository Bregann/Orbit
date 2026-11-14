'use client'

import {
  Card,
  Group,
  Title,
  Stack,
  Badge,
  Checkbox,
  Divider,
  ThemeIcon,
  Text
} from '@mantine/core'
import { IconShoppingCart, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import type { GetShoppingListItemsResponse } from '@/interfaces/api/shopping/GetShoppingListItemsResponse'
import { QueryKeys } from '@/helpers/QueryKeys'

export default function ShoppingListCard() {
  const { data: itemsData } = useQuery({
    queryKey: [QueryKeys.ShoppingListItems],
    queryFn: async () => await doQueryGet<GetShoppingListItemsResponse>('/api/shopping/GetShoppingListItems')
  })

  const items = itemsData?.items ?? []

  const { mutate: tickItem } = useMutationDelete<number, void>({
    url: (itemId) => `/api/shopping/RemoveShoppingListItem?itemId=${itemId}`,
    queryKey: [QueryKeys.ShoppingListItems],
    invalidateQuery: true,
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to remove item', 3000, <IconX />)
    }
  })

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon size="lg" radius="md" variant="light" color="orange">
            <IconShoppingCart size="1.2rem" />
          </ThemeIcon>
          <Title order={3} size="h4">Shopping List</Title>
        </Group>
        <Badge variant="light">{items.length} items</Badge>
      </Group>

      <Divider mb="md" />

      {items.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          Your list is empty. Add some items to get started!
        </Text>
      ) : (
        <Stack gap="xs">
          {items.map(item => (
            <Card
              key={item.id}
              withBorder
              p="sm"
              radius="sm"
              style={{ cursor: 'pointer' }}
              onClick={() => tickItem(item.id)}
            >
              <Group gap="sm" wrap="nowrap">
                <Checkbox
                  checked={false}
                  onChange={() => {}}
                  size="md"
                  style={{ pointerEvents: 'none' }}
                />
                <Text size="sm" fw={500}>
                  {item.name}
                </Text>
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
    queryKey: [QueryKeys.ShoppingListItems],
    queryFn: async () => await doQueryGet<GetShoppingListItemsResponse>('/api/shopping/GetShoppingListItems')
  })

  return itemsData?.items ?? []
}
