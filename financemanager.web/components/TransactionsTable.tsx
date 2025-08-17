'use client'

import { PotDropdownValue } from '@/interfaces/api/pots/PotDropdownValue'
import { TransactionsTable } from '@/interfaces/api/transactions/TransactionsTableRow'
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
  IconPhotoX
} from '@tabler/icons-react'

interface TransactionsTableProps {
  transactions: TransactionsTable[]
  potOptions: PotDropdownValue[]
  onPotChange: (transactionId: string, potId: string | null) => void
}

export default function TransactionsTableComponent(props: TransactionsTableProps) {
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
                  onChange={(value) => props.onPotChange(transaction.id, value)}
                />
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => props.onPotChange(transaction.id, null)}
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
