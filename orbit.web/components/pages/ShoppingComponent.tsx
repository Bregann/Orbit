'use client'

import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Group,
  Modal
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconRefresh,
  IconTrash
} from '@tabler/icons-react'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import QuickAddCard from '@/components/shopping/QuickAddCard'
import CommonItemsCard from '@/components/shopping/CommonItemsCard'
import ShoppingListCard, { useShoppingListItems } from '@/components/shopping/ShoppingListCard'
import ManageCommonItemsModal from '@/components/shopping/ManageCommonItemsModal'
import { QueryKeys } from '@/helpers/QueryKeys'

export default function ShoppingComponent() {
  const [newListModalOpened, { open: openNewListModal, close: closeNewListModal }] = useDisclosure(false)
  const [commonItemsModalOpened, { open: openCommonItemsModal, close: closeCommonItemsModal }] = useDisclosure(false)

  const items = useShoppingListItems()
  const checkedCount = items.filter(i => i.isPurchased).length

  const { mutate: clearAllItems, isPending: isClearingAll } = useMutationDelete<void, void>({
    url: '/api/shopping/ClearAllShoppingListItems',
    queryKey: [QueryKeys.ShoppingListItems],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Shopping list cleared', 3000, <IconCheck />)
      closeNewListModal()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to clear list', 3000, <IconX />)
    }
  })

  const { mutate: clearPurchasedItems, isPending: isClearingPurchased } = useMutationDelete<void, void>({
    url: '/api/shopping/ClearPurchasedShoppingListItems',
    queryKey: [QueryKeys.ShoppingListItems],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Purchased items cleared', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to clear items', 3000, <IconX />)
    }
  })

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Shopping List
            </Title>
            <Text c="dimmed" size="sm">
              Keep track of your shopping items
            </Text>
          </div>
          <Group>
            <Button
              variant="light"
              color="blue"
              leftSection={<IconRefresh size="1rem" />}
              onClick={openNewListModal}
            >
              New List
            </Button>
            {checkedCount > 0 && (
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size="1rem" />}
                onClick={() => clearPurchasedItems()}
                loading={isClearingPurchased}
              >
                Clear Checked ({checkedCount})
              </Button>
            )}
          </Group>
        </Group>

        {/* Quick Add */}
        <QuickAddCard />

        {/* Quick Add Common Items */}
        <CommonItemsCard onEditClick={openCommonItemsModal} currentItems={items} />

        {/* Shopping List */}
        <ShoppingListCard />
      </Stack>

      {/* New List Confirmation Modal */}
      <Modal
        opened={newListModalOpened}
        onClose={closeNewListModal}
        title="Reset Shopping List"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Choose how you want to reset your shopping list:
          </Text>
          <Button
            variant="light"
            color="orange"
            onClick={() => clearPurchasedItems()}
            leftSection={<IconTrash size="1rem" />}
            loading={isClearingPurchased}
            fullWidth
          >
            Clear Purchased Items Only
          </Button>
          <Button
            color="red"
            onClick={() => clearAllItems()}
            leftSection={<IconRefresh size="1rem" />}
            loading={isClearingAll}
            fullWidth
          >
            Clear All Items
          </Button>
          <Button
            variant="subtle"
            onClick={closeNewListModal}
            fullWidth
          >
            Cancel
          </Button>
        </Stack>
      </Modal>

      {/* Manage Common Items Modal */}
      <ManageCommonItemsModal opened={commonItemsModalOpened} onClose={closeCommonItemsModal} />
    </Container>
  )
}

