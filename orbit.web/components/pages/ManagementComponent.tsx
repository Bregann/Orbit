'use client'

import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import { GetManagePotDataDto, ManagePotData } from '@/interfaces/api/pots/GetManagePotDataDto'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { AutomaticTransaction, GetAutomaticTransactionsDto } from '@/interfaces/api/transactions/GetAutomaticTransactionsDto'
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Table,
  Input,
  Button,
  Group,
  Checkbox,
  Select,
  Modal,
  Stack,
  Badge,
  ThemeIcon,
  Divider,
  Loader,
  Center,
  Alert,
  ActionIcon,
  Tooltip
} from '@mantine/core'
import {
  IconCheck,
  IconCross,
  IconWallet,
  IconBolt,
  IconAlertCircle,
  IconTrash,
  IconDeviceFloppy,
  IconPlus,
  IconSettings
} from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export default function ManagementComponent() {
  const queryClient = useQueryClient()

  const { data: potOptions, isLoading: isLoadingPotOptions } = useQuery({
    queryKey: ['getSpendingPotDropdownOptions'],
    queryFn: async () => await doQueryGet<GetSpendingPotDropdownOptionsDto>('/api/pots/GetSpendingPotDropdownOptions')
  })

  const { data: managePotData, isLoading: isLoadingManagePotData } = useQuery({
    queryKey: ['getManagePotData'],
    queryFn: async () => await doQueryGet<GetManagePotDataDto>('/api/pots/GetManagePotData')
  })

  const { data: automaticTransactionData, isLoading: isLoadingAutomaticTransactionData } = useQuery({
    queryKey: ['getAutomaticTransactions'],
    queryFn: async () => await doQueryGet<GetAutomaticTransactionsDto>('/api/transactions/GetAutomaticTransactions')
  })

  const [addPotName, setAddPotName] = useState('')
  const [addPotAmount, setAddPotAmount] = useState('')
  const [addPotIsSavings, setAddPotIsSavings] = useState(false)
  const [addMerchantName, setAddMerchantName] = useState('')
  const [addMerchantPotId, setAddMerchantPotId] = useState<string | null>(null)

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteType, setDeleteType] = useState<'pot' | 'transaction'>('pot')
  const [deleteId, setDeleteId] = useState<number>(0)

  const { mutateAsync: addPotMutation } = useMutationPost({
    url: '/api/pots/AddNewPot',
    queryKey: ['getManagePotData'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Pot added successfully', 3000, <IconCheck />)

      setAddPotName('')
      setAddPotAmount('')
      setAddPotIsSavings(false)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message, 3000, <IconCross />)
    }
  })

  const handleAddPot = async () => {
    const reqBody = {
      potName: addPotName,
      amountToAdd: addPotAmount,
      isSavingsPot: addPotIsSavings
    }

    await addPotMutation(reqBody)
  }

  const handlePotChange = (index: number, potName?: string, potAmount?: number) => {
    queryClient.setQueryData<GetManagePotDataDto>(['getManagePotData'], (oldData) => {
      if (oldData === undefined) {
        return oldData
      }

      const updatedPots = oldData.pots.map((pot, potIndex) => {
        if (potIndex === index) {
          return { ...pot, potName: potName ?? pot.potName, amountToAdd: potAmount ?? pot.amountToAdd }
        }
        return pot
      })

      return { ...oldData, pots: updatedPots }
    })
  }

  const handleSavePot = (pot: ManagePotData) => {
    console.log('Save pot:', pot)
  }

  const handleDeletePot = (potId: number) => {
    setDeleteType('pot')
    setDeleteId(potId)
    setShowDeleteConfirmation(true)
  }

  const { mutateAsync: addAutomaticTransactionMutation } = useMutationPost({
    url: '/api/transactions/AddAutomaticTransaction',
    queryKey: ['getAutomaticTransactions'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Automatic transaction added successfully', 3000, <IconCheck />)

      setAddMerchantName('')
      setAddMerchantPotId(null)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message, 3000, <IconCross />)
    }
  })

  const handleAddAutomaticTransaction = async () => {
    const reqBody = {
      merchantName: addMerchantName,
      potId: addMerchantPotId
    }

    await addAutomaticTransactionMutation(reqBody)
  }

  const handleSaveAutomaticTransaction = (transaction: AutomaticTransaction) => {
    console.log('Save automatic transaction:', transaction)
  }

  const handleDeleteAutomaticTransaction = (transactionId: number) => {
    setDeleteType('transaction')
    setDeleteId(transactionId)
    setShowDeleteConfirmation(true)
  }

  const confirmDelete = () => {
    if (deleteType === 'pot') {
      console.log('Delete pot:', deleteId)
    } else {
      console.log('Delete automatic transaction:', deleteId)
    }
    setShowDeleteConfirmation(false)
  }

  if (isLoadingPotOptions || isLoadingManagePotData || isLoadingAutomaticTransactionData) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading management data...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (potOptions === undefined || managePotData === undefined || automaticTransactionData === undefined) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          mt="xl"
        >
          Failed to load management data. Please try refreshing the page.
        </Alert>
      </Container>
    )
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
            <Card withBorder p="lg" radius="md" shadow="sm" h="100%">
              <Stack gap="lg">
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <ThemeIcon size="lg" radius="md" variant="light" color="green">
                      <IconWallet size="1.2rem" />
                    </ThemeIcon>
                    <Title order={2} size="h3">
                      Pots
                    </Title>
                  </Group>
                  <Badge size="lg" variant="light" color="green">
                    {managePotData.pots.length} pots
                  </Badge>
                </Group>

                <Divider />

                {/* Add New Pot Form */}
                <Card withBorder p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}>
                  <Stack gap="md">
                    <Group gap="xs">
                      <ThemeIcon size="sm" radius="md" variant="light" color="blue">
                        <IconPlus size="0.9rem" />
                      </ThemeIcon>
                      <Text fw={600} size="sm">Add New Pot</Text>
                    </Group>
                    <Grid gutter="sm">
                      <Grid.Col span={{ base: 12, xs: 5 }}>
                        <Input
                          value={addPotName}
                          onChange={(e) => setAddPotName(e.target.value)}
                          placeholder="Pot name"
                          size="sm"
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 6, xs: 3 }}>
                        <Input
                          value={addPotAmount}
                          onChange={(e) => setAddPotAmount(e.target.value)}
                          placeholder="Amount"
                          size="sm"
                          type="number"
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 6, xs: 4 }}>
                        <Group gap="xs" h="100%" align="center">
                          <Checkbox
                            checked={addPotIsSavings}
                            onChange={(e) => setAddPotIsSavings(e.currentTarget.checked)}
                            label="Savings?"
                            size="sm"
                          />
                          <Button
                            onClick={async () => { await handleAddPot() }}
                            size="sm"
                            leftSection={<IconPlus size="1rem" />}
                          >
                            Add
                          </Button>
                        </Group>
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Card>

                {/* Pots Table */}
                <div style={{ overflowX: 'auto' }}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Pot Name</Table.Th>
                        <Table.Th>Amount (£)</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th ta="right">Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {managePotData.pots.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={4}>
                            <Center py="md">
                              <Text size="sm" c="dimmed">No pots created yet</Text>
                            </Center>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        managePotData.pots.map((pot, index) => (
                          <Table.Tr key={index}>
                            <Table.Td>
                              <Input
                                value={pot.potName}
                                onChange={(e) => handlePotChange(index, e.target.value, undefined)}
                                size="sm"
                              />
                            </Table.Td>
                            <Table.Td w="20%">
                              <Input
                                type="number"
                                value={pot.amountToAdd}
                                onChange={(e) => { handlePotChange(index, undefined, Number(e.target.value)) }}
                                size="sm"
                              />
                            </Table.Td>
                            <Table.Td w="15%">
                              <Badge
                                size="sm"
                                variant="light"
                                color={pot.isSavingsPot ? 'violet' : 'blue'}
                              >
                                {pot.isSavingsPot ? 'Savings' : 'Spending'}
                              </Badge>
                            </Table.Td>
                            <Table.Td ta="right">
                              <Group gap="xs" justify="flex-end" wrap="nowrap">
                                <Tooltip label="Save changes">
                                  <ActionIcon
                                    variant="light"
                                    color="green"
                                    size="lg"
                                    onClick={() => handleSavePot(pot)}
                                  >
                                    <IconDeviceFloppy size="1rem" />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Delete pot">
                                  <ActionIcon
                                    variant="light"
                                    color="red"
                                    size="lg"
                                    onClick={() => handleDeletePot(pot.potId)}
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
          </Grid.Col>

          {/* Automatic Transactions Section */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
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
                            placeholder="Select pot"
                            data={potOptions.potOptions.map(option => ({
                              value: option.potId.toString(),
                              label: option.potName
                            }))}
                            comboboxProps={{
                              transitionProps: { transition: 'pop', duration: 200 }
                            }}
                            size="sm"
                            style={{ flex: 1 }}
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
                        <Table.Th ta="right">Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {automaticTransactionData.automaticTransactions.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={3}>
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
                                value={transaction.potId.toString()}
                                onChange={setAddMerchantPotId}
                                placeholder="Pick pot"
                                data={potOptions.potOptions.map(option => ({
                                  value: option.potId.toString(),
                                  label: option.potName
                                }))}
                                comboboxProps={{
                                  transitionProps: { transition: 'pop', duration: 200 }
                                }}
                                size="sm"
                              />
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
                                    onClick={() => handleDeleteAutomaticTransaction(transaction.id)}
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
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        title={
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" color="red" variant="light">
              <IconAlertCircle size="1.2rem" />
            </ThemeIcon>
            <Text fw={600}>Confirm Deletion</Text>
          </Group>
        }
        centered
        size="md"
      >
        <Stack gap="lg">
          <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
            <Text size="sm">
              Are you sure you want to delete this {deleteType === 'pot' ? 'pot' : 'automatic transaction rule'}?
              This action cannot be undone.
            </Text>
          </Alert>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size="1rem" />}
              onClick={confirmDelete}
            >
              Yes, Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
