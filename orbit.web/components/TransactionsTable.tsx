'use client'

import { doPatch } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { QueryKeys } from '@/helpers/QueryKeys'
import { PotDropdownValue } from '@/interfaces/api/pots/PotDropdownValue'
import { TransactionsTableRow } from '@/interfaces/api/transactions/TransactionsTableRow'
import {
  Table,
  Select,
  ActionIcon,
  Image,
  Text,
  Paper
} from '@mantine/core'
import {
  IconTrash,
  IconPhotoX,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface TransactionsTableProps {
  transactions: TransactionsTableRow[]
  potOptions: PotDropdownValue[]
}

export default function TransactionsTableComponent(props: TransactionsTableProps) {
  const queryClient = useQueryClient()

  const updateTransactionMutation = useMutation({
    mutationFn: async (data: { transactionId: string, potId: number | null }) => {
      await doPatch('/api/Transactions/UpdateTransaction', { body: { transactionId: data.transactionId, potId: data.potId } })
    },
    onSuccess: () =>{
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GetUnprocessedTransactions] })
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HomepageStats] })
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ThisMonthTransactions] })
      notificationHelper.showSuccessNotification('Success', 'Transaction updated successfully', 3000, <IconCheck />)
    },
    onError: () =>{
      notificationHelper.showErrorNotification('Error', 'Failed to update transaction', 3000, <IconX />)
    }
  })

  return (
    <Paper withBorder radius="md" p="md" shadow="sm">
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Icon</Table.Th>
            <Table.Th>Merchant</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Pot Type</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {props.transactions.map((transaction) => (
            <Table.Tr key={transaction.id}>
              <Table.Td>
                {transaction.iconUrl !== '' ?
                  <Image
                    src={transaction.iconUrl}
                    alt="Merchant icon"
                    width={32}
                    height={32}
                    radius="sm"
                  />
                  :
                  <IconPhotoX size={32} color="gray" />
                }
              </Table.Td>
              <Table.Td>
                <Text fw={500}>{transaction.merchantName}</Text>
              </Table.Td>
              <Table.Td>
                <Text fw={500}>{transaction.transactionAmount}</Text>
              </Table.Td>
              <Table.Td>
                <Text c="dimmed">{new Date(transaction.transactionDate).toLocaleDateString().concat(' ', new Date(transaction.transactionDate).toLocaleTimeString())}</Text>
              </Table.Td>
              <Table.Td>
                <Select
                  placeholder="Pick pot"
                  data={props.potOptions.map(option => ({
                    value: option.potId.toString(),
                    label: option.potName
                  }))}
                  defaultValue={transaction.potId?.toString() ?? null}
                  comboboxProps={{
                    transitionProps: { transition: 'pop', duration: 200 }
                  }}
                  onChange={async (value) => { await updateTransactionMutation.mutateAsync({ transactionId: transaction.id, potId: value !== null ? Number(value) : null }) }}
                />
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={async () => { await updateTransactionMutation.mutateAsync({ transactionId: transaction.id, potId: null }) }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  )
}
