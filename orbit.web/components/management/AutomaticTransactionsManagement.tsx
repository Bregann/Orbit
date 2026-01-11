'use client'

import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import { QueryKeys } from '@/helpers/QueryKeys'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { AutomaticTransaction, GetAutomaticTransactionsDto } from '@/interfaces/api/transactions/GetAutomaticTransactionsDto'
import {
  Card,
  Text,
  Title,
  Table,
  Input,
  Button,
  Group,
  Select,
  Grid,
  Stack,
  Badge,
  ThemeIcon,
  Divider,
  Center,
  ActionIcon,
  Tooltip,
  Checkbox
} from '@mantine/core'
import {
  IconCheck,
  IconCross,
  IconBolt,
  IconTrash,
  IconDeviceFloppy,
  IconPlus,
  IconCalendar
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

interface AutomaticTransactionsManagementProps {
  onDeleteTransaction: (_transactionId: number) => void
}

export default function AutomaticTransactionsManagement({
  onDeleteTransaction
}: AutomaticTransactionsManagementProps) {
  const [addMerchantName, setAddMerchantName] = useState('')
  const [addMerchantPotId, setAddMerchantPotId] = useState<string | null>(null)
  const [addIsSubscription, setAddIsSubscription] = useState(false)

  const { data: potOptions } = useQuery({
    queryKey: [QueryKeys.GetSpendingPotDropdownOptions],
    queryFn: async () => await doQueryGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions')
  })

  const { data: automaticTransactionData } = useQuery({
    queryKey: [QueryKeys.GetAutomaticTransactions],
    queryFn: async () => await doQueryGet<GetAutomaticTransactionsDto>('/api/transactions/GetAutomaticTransactions')
  })

  const { mutateAsync: addAutomaticTransactionMutation } = useMutationPost({
    url: '/api/transactions/AddAutomaticTransaction',
    queryKey: [QueryKeys.GetAutomaticTransactions],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Automatic transaction added successfully', 3000, <IconCheck />)
      setAddMerchantName('')
      setAddMerchantPotId(null)
      setAddIsSubscription(false)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message, 3000, <IconCross />)
    }
  })

  const handleAddAutomaticTransaction = async () => {
    const reqBody = {
      merchantName: addMerchantName,
      potId: addMerchantPotId,
      isSubscription: addIsSubscription
    }
    await addAutomaticTransactionMutation(reqBody)
  }

  const handleSaveAutomaticTransaction = (transaction: AutomaticTransaction) => {
    console.log('Save automatic transaction:', transaction)
  }

  if (!potOptions || !automaticTransactionData) return null

  return (
    <Card withBorder p="lg" radius="md" shadow="sm" h="100%">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
              <IconBolt size="1.2rem" />
            </ThemeIcon>
            <Title order={2} size="h3">
              Automatic Transactions
            </Title>
          </Group>
          <Badge size="lg" variant="light" color="orange">
            {automaticTransactionData.automaticTransactions.length} rules
          </Badge>
        </Group>

        <Divider />

        {/* Add New Rule Form */}
        <Card withBorder p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}>
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon size="sm" radius="md" variant="light" color="blue">
                <IconPlus size="0.9rem" />
              </ThemeIcon>
              <Text fw={600} size="sm">Add New Rule</Text>
            </Group>
            <Grid gutter="sm">
              <Grid.Col span={{ base: 12, xs: 6 }}>
                <Input
                  value={addMerchantName}
                  onChange={(e) => setAddMerchantName(e.target.value)}
                  placeholder="Merchant name"
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 6 }}>
                <Group gap="xs">
                  <Select
                    value={addMerchantPotId}
                    onChange={setAddMerchantPotId}
                    placeholder="Select pot (optional)"
                    data={potOptions.potOptions.map(option => ({
                      value: option.potId.toString(),
                      label: option.potName
                    }))}
                    comboboxProps={{
                      transitionProps: { transition: 'pop', duration: 200 }
                    }}
                    size="sm"
                    style={{ flex: 1 }}
                    clearable
                  />
                  <Button
                    onClick={handleAddAutomaticTransaction}
                    size="sm"
                    leftSection={<IconPlus size="1rem" />}
                  >
                    Add
                  </Button>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12 }}>
                <Checkbox
                  checked={addIsSubscription}
                  onChange={(e) => setAddIsSubscription(e.currentTarget.checked)}
                  label="Is Subscription"
                  size="sm"
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Automatic Transactions Table */}
        <div style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Merchant Name</Table.Th>
                <Table.Th>Pot Assignment</Table.Th>
                <Table.Th>Subscription</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {automaticTransactionData.automaticTransactions.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Center py="md">
                      <Text size="sm" c="dimmed">No automatic rules configured yet</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                automaticTransactionData.automaticTransactions.map((transaction) => (
                  <Table.Tr key={transaction.id}>
                    <Table.Td>
                      <Input
                        value={transaction.merchantName}
                        onChange={(e) => console.log(e)}
                        size="sm"
                      />
                    </Table.Td>
                    <Table.Td w="35%">
                      <Select
                        value={transaction.potId?.toString() ?? null}
                        onChange={(value) =>
                          handleSaveAutomaticTransaction({
                            ...transaction,
                            potId: value ? Number(value) : null
                          })
                        }
                        placeholder="Pick pot (optional)"
                        data={potOptions.potOptions.map(option => ({
                          value: option.potId.toString(),
                          label: option.potName
                        }))}
                        comboboxProps={{
                          transitionProps: { transition: 'pop', duration: 200 }
                        }}
                        size="sm"
                        clearable
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {transaction.isSubscription && (
                          <Badge
                            size="sm"
                            variant="light"
                            color="blue"
                            leftSection={<IconCalendar size="0.8rem" />}
                          >
                            Sub
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Group gap="xs" justify="flex-end" wrap="nowrap">
                        <Tooltip label="Save changes">
                          <ActionIcon
                            variant="light"
                            color="green"
                            size="lg"
                            onClick={() => handleSaveAutomaticTransaction(transaction)}
                          >
                            <IconDeviceFloppy size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete rule">
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="lg"
                            onClick={() => onDeleteTransaction(transaction.id)}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </div>
      </Stack>
    </Card>
  )
}
