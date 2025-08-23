'use client'

import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import { GetManagePotDataDto, ManagePotData } from '@/interfaces/api/pots/GetManagePotDataDto'
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/pots/GetSpendingPotDropdownOptionsDto'
import { AutomaticTransaction, GetAutomaticTransactionsDto } from '@/interfaces/api/transactions/GetAutomaticTransactionsDto'
import { Container,Grid, Paper,Text, Title, Table, Input, Button, Group, Checkbox, Select, Modal, Stack } from '@mantine/core'
import { IconCheck, IconCross } from '@tabler/icons-react'
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
    return <div>Loading...</div>
  }

  if (potOptions === undefined || managePotData === undefined || automaticTransactionData === undefined) {
    return <div>Error loading data</div>
  }

  return (
    <Container size="95%">
      <Title order={1} mb="xl" ta="center">
        Pot/Automatic Transactions Management
      </Title>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md" shadow="sm">
            <Title order={2} mb="lg" ta="center">
              Pots
            </Title>
            <Group justify="center" mb="lg">
              <Input.Wrapper label="Name" style={{ width: '40%' }}>
                <Input
                  value={addPotName}
                  onChange={(e) => setAddPotName(e.target.value)}
                  placeholder="Enter pot name"
                />
              </Input.Wrapper>
              <Input.Wrapper label="Amount" style={{ width: '15%' }}>
                <Input
                  value={addPotAmount}
                  onChange={(e) => setAddPotAmount(e.target.value)}
                  placeholder="0"
                />
              </Input.Wrapper>
              <Checkbox
                checked={addPotIsSavings}
                onChange={(e) => setAddPotIsSavings(e.currentTarget.checked)}
                label="Savings pot?"
                mt="xl"
              />
              <Button
                onClick={async () => { await handleAddPot() }}
                mt="xl"
              >
                Add
              </Button>
            </Group>

            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Pot Name</Table.Th>
                  <Table.Th>Amount (£)</Table.Th>
                  <Table.Th>Savings?</Table.Th>
                  <Table.Th ta="right" w="25%">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {managePotData.pots.map((pot, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Input
                        value={pot.potName}
                        onChange={(e) => handlePotChange(index, e.target.value, undefined)}
                      />
                    </Table.Td>
                    <Table.Td w="15%">
                      <Input
                        type='number'
                        value={pot.amountToAdd}
                        onChange={(e) => { handlePotChange(index, undefined, Number(e.target.value)) }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Checkbox
                        checked={pot.isSavingsPot}
                        disabled
                        style={{ paddingLeft: 15 }}
                      />
                    </Table.Td>
                    <Table.Td ta="right">
                      <Group gap="xs" justify="flex-end">
                        <Button
                          variant="filled"
                          color="green"
                          size="xs"
                          onClick={() => handleSavePot(pot)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="filled"
                          color="red"
                          size="xs"
                          onClick={() => handleDeletePot(pot.potId)}
                        >
                          Delete
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md" shadow="sm">
            <Title order={2} mb="lg" ta="center">
              Automatic Transactions
            </Title>
            <Group justify="center" mb="lg">
              <Input.Wrapper label="Merchant Name" style={{ width: '45%' }}>
                <Input
                  value={addMerchantName}
                  onChange={(e) => setAddMerchantName(e.target.value)}
                  placeholder="Enter merchant name"
                />
              </Input.Wrapper>
              <Input.Wrapper label="Pot Name" style={{ width: '25%' }}>
                <Select
                  value={addMerchantPotId}
                  onChange={setAddMerchantPotId}
                  placeholder="Pick pot"
                  data={potOptions.potOptions.map(option => ({
                    value: option.potId.toString(),
                    label: option.potName
                  }))}
                  comboboxProps={{
                    transitionProps: { transition: 'pop', duration: 200 }
                  }}
                />
              </Input.Wrapper>
              <Button
                onClick={handleAddAutomaticTransaction}
                mt="xl"
              >
                Add
              </Button>
            </Group>

            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Merchant Name</Table.Th>
                  <Table.Th w="30%">Pot</Table.Th>
                  <Table.Th ta="right" w="25%">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {automaticTransactionData.automaticTransactions.map((transaction) => (
                  <Table.Tr key={transaction.id}>
                    <Table.Td>
                      <Input
                        value={transaction.merchantName}
                        onChange={(e) => console.log(e)}
                      />
                    </Table.Td>
                    <Table.Td>
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
                      />
                    </Table.Td>
                    <Table.Td ta="right">
                      <Group gap="xs" justify="flex-end">
                        <Button
                          variant="filled"
                          color="green"
                          size="xs"
                          onClick={() => handleSaveAutomaticTransaction(transaction)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="filled"
                          color="red"
                          size="xs"
                          onClick={() => handleDeleteAutomaticTransaction(transaction.id)}
                        >
                          Delete
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>
      </Grid>

      <Modal
        opened={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        title={`Delete ${deleteType === 'pot' ? 'Pot' : 'Automatic Transaction'}`}
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this {deleteType === 'pot' ? 'pot' : 'automatic transaction'}?
            This action cannot be undone.
          </Text>
          <Group justify="center">
            <Button color="red" onClick={confirmDelete}>
              Yes, Delete
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
