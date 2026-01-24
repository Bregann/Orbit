'use client'

import { doPatch } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { QueryKeys } from '@/helpers/QueryKeys'
import { PotDropdownValue } from '@/interfaces/api/pots/PotDropdownValue'
import {
  Modal,
  Button,
  Select,
  NumberInput,
  Stack,
  Group,
  Text,
  ActionIcon,
  Paper,
  Alert
} from '@mantine/core'
import {
  IconTrash,
  IconPlus,
  IconCheck,
  IconX,
  IconAlertCircle
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

interface SplitTransactionModalProps {
  opened: boolean
  onClose: () => void
  transactionId: string
  transactionAmount: number
  merchantName: string
  potOptions: PotDropdownValue[]
}

interface TransactionSplit {
  id: string
  potId: number
  amount: number
}

export default function SplitTransactionModal(props: SplitTransactionModalProps) {
  const queryClient = useQueryClient()
  const [splits, setSplits] = useState<TransactionSplit[]>([
    { id: '-1', potId: -1, amount: 0 }
  ])

  // Handle both number and string (formatted) transaction amounts
  const transactionAmount = typeof props.transactionAmount === 'number'
    ? props.transactionAmount
    : Number(String(props.transactionAmount).replace(/[£$,]/g, '')) || 0

  const totalAllocated = Math.round(splits.reduce((sum, split) => sum + (split.amount || 0), 0) * 100) / 100
  const remaining = Math.round((transactionAmount - totalAllocated) * 100) / 100

  useEffect(() => {
    if (props.opened) {
      // Reset splits when modal opens
      setSplits([{ id: '-1', potId: -1, amount: 0 }])
    }
  }, [props.opened])

  const splitTransactionMutation = useMutation({
    mutationFn: async (data: { transactionId: string, splits: Array<{ id: string, potId: number, amount: number }> }) => {
      await doPatch('/api/Transactions/SplitTransaction', {
        body: {
          transactionId: data.transactionId,
          splits: data.splits.map(split => ({
            id: split.id,
            potId: split.potId,
            amount: Math.round(split.amount * 100) // Convert to pence
          }))
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GetUnprocessedTransactions] })
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HomepageStats] })
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ThisMonthTransactions] })
      notificationHelper.showSuccessNotification('Success', 'Transaction split successfully', 3000, <IconCheck />)
      props.onClose()
    },
    onError: () => {
      notificationHelper.showErrorNotification('Error', 'Failed to split transaction', 3000, <IconX />)
    }
  })

  const addSplit = () => {
    const newId = (Math.min(...splits.map(s => parseInt(s.id))) - 1).toString()
    setSplits([...splits, { id: newId, potId: -1, amount: 0 }])
  }

  const removeSplit = (id: string) => {
    if (splits.length > 1) {
      setSplits(splits.filter(split => split.id !== id))
    }
  }

  const updateSplit = (id: string, field: 'potId' | 'amount', value: number | null | string) => {
    setSplits(splits.map(split =>
      split.id === id ? { ...split, [field]: value } : split
    ))
  }

  const handleSubmit = () => {
    // Validate that all splits with amounts have a valid pot selected
    const splitsWithAmount = splits.filter(split => split.amount > 0)

    if (splitsWithAmount.length === 0) {
      notificationHelper.showErrorNotification('Error', 'Please add at least one valid split', 3000, <IconX />)
      return
    }

    // Check all splits have unique pot selections
    const hasInvalidPot = splitsWithAmount.some(split => {
      const otherSelectedPots = splits
        .filter(s => s.id !== split.id)
        .map(s => s.potId)
      return otherSelectedPots.includes(split.potId)
    })

    if (hasInvalidPot) {
      notificationHelper.showErrorNotification('Error', 'Please select a valid pot for all splits', 3000, <IconX />)
      return
    }

    // Use small epsilon for floating point comparison (0.01 for currency)
    if (totalAllocated > transactionAmount + 0.01) {
      notificationHelper.showErrorNotification('Error', 'Total allocated amount exceeds transaction amount', 3000, <IconX />)
      return
    }

    splitTransactionMutation.mutate({
      transactionId: props.transactionId,
      splits: splitsWithAmount.map(split => ({
        id: split.id,
        potId: split.potId,
        amount: split.amount
      }))
    })
  }

  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title={`Split Transaction - ${props.merchantName}`}
      size="lg"
    >
      <Stack gap="md">
        <Paper withBorder p="md" bg="dark.8">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Transaction Amount:</Text>
            <Text size="lg" fw={700}>£{transactionAmount.toFixed(2)}</Text>
          </Group>
          <Group justify="space-between" mt="xs">
            <Text size="sm" c="dimmed">Total Allocated:</Text>
            <Text size="lg" fw={700} c={totalAllocated > transactionAmount + 0.01 ? 'red' : 'blue'}>
              £{totalAllocated.toFixed(2)}
            </Text>
          </Group>
          <Group justify="space-between" mt="xs">
            <Text size="sm" c="dimmed">Remaining:</Text>
            <Text size="lg" fw={700} c={remaining < -0.01 ? 'red' : 'green'}>
              £{remaining.toFixed(2)}
            </Text>
          </Group>
        </Paper>

        {totalAllocated > transactionAmount + 0.01 && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            Total allocated amount exceeds transaction amount!
          </Alert>
        )}

        <Text size="sm" c="dimmed">
          Split this transaction into multiple pots. You can allocate less than the full amount if someone paid you back. Use "Unallocated" to exclude amounts from pot tracking (e.g., if someone reimbursed you £10 of a £20 transaction).
        </Text>

        <Stack gap="sm">
          {splits.map((split, index) => {
            // Get pot IDs already selected by other splits
            const selectedPotIds = splits
              .filter(s => s.id !== split.id)
              .map(s => s.potId)

            // Filter out already selected pots
            const availablePots = props.potOptions.filter(
              option => !selectedPotIds.includes(option.potId)
            )

            // Check if unallocated is already selected elsewhere
            const isUnallocatedAvailable = !selectedPotIds.includes(-1)

            return (
              <Paper key={split.id} withBorder p="md">
                <Group gap="md" align="flex-start">
                  <NumberInput
                    label={`Amount ${index + 1}`}
                    placeholder="0.00"
                    value={split.amount}
                    onChange={(value) => updateSplit(split.id, 'amount', value ?? 0)}
                    prefix="£"
                    decimalScale={2}
                    min={0}
                    max={transactionAmount}
                    style={{ flex: 1 }}
                  />
                  <Select
                    label="Pot"
                    placeholder="Select pot"
                    data={[
                      ...(isUnallocatedAvailable ? [{ value: '-1', label: 'Unallocated (Exclude)' }] : []),
                      ...availablePots.map(option => ({
                        value: option.potId.toString(),
                        label: option.potName
                      }))
                    ]}
                    value={split.potId.toString()}
                    onChange={(value) => updateSplit(split.id, 'potId', value !== null ? Number(value) : -1)}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => removeSplit(split.id)}
                    disabled={splits.length === 1}
                    mt={28}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            )
          })}
        </Stack>

        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={addSplit}
          fullWidth
        >
          Add Another Split
        </Button>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={splitTransactionMutation.isPending}
            disabled={
              Math.abs(remaining) > 0.01 ||
              splits.some(split => {
                if (split.amount === 0) return false
                const otherSelectedPots = splits
                  .filter(s => s.id !== split.id)
                  .map(s => s.potId)
                return otherSelectedPots.includes(split.potId)
              })
            }
          >
            Split Transaction
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
