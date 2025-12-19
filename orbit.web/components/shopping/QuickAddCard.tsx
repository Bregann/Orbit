'use client'

import { Card, Group, TextInput, Button } from '@mantine/core'
import { useState } from 'react'
import { IconPlus, IconCheck, IconX } from '@tabler/icons-react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import { QueryKeys } from '@/helpers/QueryKeys'

export default function QuickAddCard() {
  const [quickAddName, setQuickAddName] = useState('')

  const { mutateAsync: addItem, isPending } = useMutationPost<void, void>({
    url: `/api/shopping/AddShoppingListItem?name=${encodeURIComponent(quickAddName.trim())}`,
    queryKey: [QueryKeys.ShoppingListItems],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Item added to shopping list', 3000, <IconCheck />)
      setQuickAddName('')
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add item', 3000, <IconX />)
    }
  })

  const handleQuickAdd = async () => {
    if (!quickAddName.trim()) return
    await addItem()
  }

  return (
    <Card withBorder p="md" radius="md" shadow="sm">
      <Group gap="sm">
        <TextInput
          placeholder="Quick add item..."
          value={quickAddName}
          onChange={(e) => setQuickAddName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isPending) handleQuickAdd()
          }}
          style={{ flex: 1 }}
          leftSection={<IconPlus size="1rem" />}
          disabled={isPending}
        />
        <Button onClick={handleQuickAdd} disabled={!quickAddName.trim() || isPending} loading={isPending}>
          Add
        </Button>
      </Group>
    </Card>
  )
}
