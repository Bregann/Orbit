'use client'

import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import { DeleteSubscriptionRequest } from '@/interfaces/api/subscriptions/DeleteSubscriptionRequest'
import PotsManagement from '@/components/management/PotsManagement'
import AutomaticTransactionsManagement from '@/components/management/AutomaticTransactionsManagement'
import SubscriptionsManagement from '@/components/management/SubscriptionsManagement'
import {
  Container,
  Grid,
  Text,
  Title,
  Group,
  Stack,
  ThemeIcon
} from '@mantine/core'
import {
  IconCheck,
  IconCross,
  IconSettings
} from '@tabler/icons-react'
import { useState } from 'react'
import { QueryKeys } from '@/helpers/QueryKeys'
import DeleteConfirmationModal from '../common/DeleteConfirmationModal'

export default function ManagementComponent() {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteType, setDeleteType] = useState<'pot' | 'transaction' | 'payment'>('pot')
  const [deleteId, setDeleteId] = useState<number>(0)

  const { mutateAsync: deleteSubscriptionMutation } = useMutationDelete<DeleteSubscriptionRequest, void>({
    url: (input) => `/api/subscriptions/DeleteSubscription?id=${input.id}`,
    queryKey: [QueryKeys.GetSubscriptions],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Subscription deleted successfully', 3000, <IconCheck />)
    },
    onError: (error: Error) => {
      notificationHelper.showErrorNotification('Error', error.message, 3000, <IconCross />)
    }
  })

  const handleDeletePot = (potId: number) => {
    setDeleteType('pot')
    setDeleteId(potId)
    setShowDeleteConfirmation(true)
  }

  const handleDeleteAutomaticTransaction = (transactionId: number) => {
    setDeleteType('transaction')
    setDeleteId(transactionId)
    setShowDeleteConfirmation(true)
  }

  const handleDeleteSubscription = (subscriptionId: number) => {
    setDeleteType('payment')
    setDeleteId(subscriptionId)
    setShowDeleteConfirmation(true)
  }

  const confirmDelete = async () => {
    if (deleteType === 'pot') {
      console.log('Delete pot:', deleteId)
    } else if (deleteType === 'transaction') {
      console.log('Delete automatic transaction:', deleteId)
    } else {
      await deleteSubscriptionMutation({ id: deleteId })
    }
    setShowDeleteConfirmation(false)
  }

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <div>
          <Group gap="sm" mb="xs">
            <ThemeIcon size="xl" radius="md" variant="light" color="blue">
              <IconSettings size="1.5rem" />
            </ThemeIcon>
            <Title order={1}>
              Management
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            Manage your pots and configure automatic transaction rules
          </Text>
        </div>

        <Grid gutter="lg">
          {/* Pots Management Section */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <PotsManagement onDeletePot={handleDeletePot} />
          </Grid.Col>

          {/* Automatic Transactions Section */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <AutomaticTransactionsManagement
              onDeleteTransaction={handleDeleteAutomaticTransaction}
            />
          </Grid.Col>
        </Grid>

        {/* Subscriptions Section */}
        <SubscriptionsManagement
          onDeleteSubscription={handleDeleteSubscription}
        />
      </Stack>

      <DeleteConfirmationModal
        opened={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Are You Sure?"
        message="Do you really want to delete this item? This action cannot be undone."
      />
    </Container>
  )
}
