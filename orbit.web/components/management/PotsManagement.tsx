'use client'

import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import { GetManagePotDataDto, ManagePotData } from '@/interfaces/api/pots/GetManagePotDataDto'
import {
  Card,
  Text,
  Title,
  Table,
  Input,
  Button,
  Group,
  Checkbox,
  Grid,
  Stack,
  Badge,
  ThemeIcon,
  Divider,
  Center,
  ActionIcon,
  Tooltip
} from '@mantine/core'
import {
  IconCheck,
  IconCross,
  IconWallet,
  IconTrash,
  IconDeviceFloppy,
  IconPlus
} from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface PotsManagementProps {
  onDeletePot: (_potId: number) => void
}

export default function PotsManagement({ onDeletePot }: PotsManagementProps) {
  const queryClient = useQueryClient()
  const [addPotName, setAddPotName] = useState('')
  const [addPotAmount, setAddPotAmount] = useState('')
  const [addPotIsSavings, setAddPotIsSavings] = useState(false)
  const [addPotRollover, setAddPotRollover] = useState(false)

  const { data: managePotData } = useQuery({
    queryKey: ['getManagePotData'],
    queryFn: async () => await doQueryGet<GetManagePotDataDto>('/api/pots/GetManagePotData')
  })

  const { mutateAsync: addPotMutation } = useMutationPost({
    url: '/api/pots/AddNewPot',
    queryKey: ['getManagePotData'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Pot added successfully', 3000, <IconCheck />)
      setAddPotName('')
      setAddPotAmount('')
      setAddPotIsSavings(false)
      setAddPotRollover(false)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message, 3000, <IconCross />)
    }
  })

  const handleAddPot = async () => {
    const reqBody = {
      potName: addPotName,
      amountToAdd: addPotAmount,
      isSavingsPot: addPotIsSavings,
      rolloverByDefault: addPotIsSavings ? false : addPotRollover
    }
    await addPotMutation(reqBody)
  }

  const handlePotChange = (index: number, potName?: string, potAmount?: number, rollover?: boolean) => {
    queryClient.setQueryData<GetManagePotDataDto>(['getManagePotData'], (oldData) => {
      if (oldData === undefined) {
        return oldData
      }

      const updatedPots = oldData.pots.map((pot, potIndex) => {
        if (potIndex === index) {
          return {
            ...pot,
            potName: potName ?? pot.potName,
            amountToAdd: potAmount ?? pot.amountToAdd,
            rolloverByDefault: rollover ?? pot.rolloverByDefault
          }
        }
        return pot
      })

      return { ...oldData, pots: updatedPots }
    })
  }

  const handleSavePot = (pot: ManagePotData) => {
    console.log('Save pot:', pot)
  }

  if (!managePotData) return null

  return (
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
              <Grid.Col span={{ base: 12, xs: 4 }}>
                <Stack gap="xs">
                  <Group gap="xs" wrap="nowrap">
                    <Checkbox
                      checked={addPotIsSavings}
                      onChange={(e) => {
                        setAddPotIsSavings(e.currentTarget.checked)
                        if (e.currentTarget.checked) {
                          setAddPotRollover(false)
                        }
                      }}
                      label="Savings?"
                      size="sm"
                    />
                    {!addPotIsSavings && (
                      <Checkbox
                        checked={addPotRollover}
                        onChange={(e) => setAddPotRollover(e.currentTarget.checked)}
                        label="Auto Rollover?"
                        size="sm"
                      />
                    )}
                  </Group>
                  <Button
                    onClick={async () => { await handleAddPot() }}
                    size="sm"
                    fullWidth
                    leftSection={<IconPlus size="1rem" />}
                  >
                    Add
                  </Button>
                </Stack>
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
                <Table.Th>Auto Rollover</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {managePotData.pots.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
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
                        value={pot.potName || ''}
                        onChange={(e) => handlePotChange(index, e.target.value, undefined, undefined)}
                        size="sm"
                      />
                    </Table.Td>
                    <Table.Td w="20%">
                      <Input
                        type="number"
                        value={pot.amountToAdd || ''}
                        onChange={(e) => { handlePotChange(index, undefined, Number(e.target.value), undefined) }}
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
                    <Table.Td w="15%">
                      {!pot.isSavingsPot && (
                        <Checkbox
                          checked={pot.rolloverByDefault || false}
                          onChange={(e) => handlePotChange(index, undefined, undefined, e.currentTarget.checked)}
                          size="sm"
                        />
                      )}
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
                            onClick={() => onDeletePot(pot.potId)}
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
