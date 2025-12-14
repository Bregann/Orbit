'use client'

import {
  Card,
  Group,
  Title,
  Button,
  Divider,
  ThemeIcon,
  ActionIcon,
  Text
} from '@mantine/core'
import { IconBasket, IconEdit, IconPlus, IconCheck, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import type { GetShoppingListQuickAddItemsResponse } from '@/interfaces/api/shopping/GetShoppingListQuickAddItemsResponse'
import type { ShoppingListItem } from '@/interfaces/api/shopping/GetShoppingListItemsResponse'

interface CommonItemsCardProps {
  onEditClick: () => void
  currentItems: ShoppingListItem[]
}

export default function CommonItemsCard({ onEditClick, currentItems }: CommonItemsCardProps) {
  const { data: quickAddData } = useQuery({
    queryKey: ['shoppingListQuickAddItems'],
    queryFn: async () => await doQueryGet<GetShoppingListQuickAddItemsResponse>('/api/shopping/GetShoppingListQuickAddItems')
  })

  const commonItems = quickAddData?.items ?? []

  const handleAddCommonItem = async (itemName: string) => {
    const existing = currentItems.find(i => i.name.toLowerCase() === itemName.toLowerCase() && !i.isPurchased)
    if (existing) {
      notificationHelper.showErrorNotification('Duplicate', 'Item already in your list', 3000, <IconX />)
      return
    }

    const { mutateAsync } = useMutationPost<void, void>({
      url: `/api/shopping/AddShoppingListItem?name=${encodeURIComponent(itemName)}`,
      queryKey: ['shoppingListItems'],
      invalidateQuery: true,
      onSuccess: () => {
        notificationHelper.showSuccessNotification('Success', 'Item added to shopping list', 3000, <IconCheck />)
      },
      onError: (error) => {
        notificationHelper.showErrorNotification('Error', error.message || 'Failed to add item', 3000, <IconX />)
      }
    })

    await mutateAsync()
  }

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
            <IconBasket size="1.2rem" />
          </ThemeIcon>
          <Title order={4} size="h5">Quick Add Common Items</Title>
        </Group>
        <ActionIcon
          variant="light"
          color="blue"
          size="sm"
          onClick={onEditClick}
          title="Edit Common Items"
        >
          <IconEdit size="0.9rem" />
        </ActionIcon>
      </Group>
      <Divider mb="md" />
      {commonItems.length === 0 ? (
        <Text c="dimmed" ta="center" py="md">
          No common items. Click edit to add some!
        </Text>
      ) : (
        <Group gap="xs">
          {commonItems.map((item) => (
            <Button
              key={item.id}
              size="xs"
              variant="light"
              leftSection={<IconPlus size="0.8rem" />}
              onClick={() => handleAddCommonItem(item.name)}
            >
              {item.name}
            </Button>
          ))}
        </Group>
      )}
    </Card>
  )
}
