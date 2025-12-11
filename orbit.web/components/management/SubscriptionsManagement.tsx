'use client'

import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import { useMutationPatch } from '@/helpers/mutations/useMutationPatch'
import notificationHelper from '@/helpers/notificationHelper'
import { GetSubscriptionsDto } from '@/interfaces/api/subscriptions/GetSubscriptionsDto'
import { SubscriptionItem, BillingFrequency, BillingFrequencyOptions } from '@/interfaces/api/subscriptions/MonthlyPayment'
import { UpdateSubscriptionRequest } from '@/interfaces/api/subscriptions/UpdateSubscriptionRequest'
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
  NumberInput
} from '@mantine/core'
import {
  IconCheck,
  IconCross,
  IconCalendarRepeat,
  IconTrash,
  IconDeviceFloppy,
  IconPlus
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

interface SubscriptionsManagementProps {
  onDeleteSubscription: (_subscriptionId: number) => void
}

export default function SubscriptionsManagement({ onDeleteSubscription }: SubscriptionsManagementProps) {
  const [addPaymentName, setAddPaymentName] = useState('')
  const [addPaymentAmount, setAddPaymentAmount] = useState<number | string>('')
  const [addPaymentBillingDate, setAddPaymentBillingDate] = useState<number | string>(1)
  const [addPaymentBillingMonth, setAddPaymentBillingMonth] = useState<number | string>(1)
  const [addPaymentFrequency, setAddPaymentFrequency] = useState<string | null>('0')
  const [editedSubscriptions, setEditedSubscriptions] = useState<Record<number, Partial<SubscriptionItem>>>({})

  const { data: subscriptionsData } = useQuery({
    queryKey: ['getSubscriptions'],
    queryFn: async () => await doQueryGet<GetSubscriptionsDto>('/api/subscriptions/GetSubscriptions')
  })

  const { mutateAsync: addSubscriptionMutation } = useMutationPost({
    url: '/api/subscriptions/AddSubscription',
    queryKey: ['getSubscriptions'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Subscription added successfully', 3000, <IconCheck />)
      setAddPaymentName('')
      setAddPaymentAmount('')
      setAddPaymentBillingDate(1)
      setAddPaymentBillingMonth(1)
      setAddPaymentFrequency('0')
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message, 3000, <IconCross />)
    }
  })

  const { mutateAsync: updateSubscriptionMutation } = useMutationPatch<UpdateSubscriptionRequest, void>({
    url: '/api/subscriptions/UpdateSubscription',
    queryKey: ['getSubscriptions'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Subscription updated successfully', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message, 3000, <IconCross />)
    }
  })

  const handleAddSubscription = async () => {
    const reqBody: any = {
      subscriptionName: addPaymentName,
      subscriptionAmount: Math.round(Number(addPaymentAmount) * 100),
      billingDay: Number(addPaymentBillingDate),
      billingFrequency: Number(addPaymentFrequency) as BillingFrequency
    }

    if (Number(addPaymentFrequency) === BillingFrequency.Yearly) {
      reqBody.billingMonth = Number(addPaymentBillingMonth)
    }

    await addSubscriptionMutation(reqBody)
  }

  const handleSaveSubscription = async (subscription: SubscriptionItem) => {
    const reqBody: UpdateSubscriptionRequest = {
      id: subscription.id,
      subscriptionName: subscription.name,
      subscriptionAmount: Math.round(subscription.amount * 100),
      billingDay: subscription.billingDay,
      billingFrequency: subscription.billingFrequency
    }

    if (subscription.billingFrequency === BillingFrequency.Yearly && subscription.billingMonth) {
      reqBody.billingMonth = subscription.billingMonth
    }

    await updateSubscriptionMutation(reqBody)
  }

  const handleDeleteClick = async (subscriptionId: number) => {
    onDeleteSubscription(subscriptionId)
  }

  if (!subscriptionsData) return null

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="violet">
              <IconCalendarRepeat size="1.2rem" />
            </ThemeIcon>
            <Title order={2} size="h3">
              Monthly Payments / Subscriptions
            </Title>
          </Group>
          <Badge size="lg" variant="light" color="violet">
            {subscriptionsData.subscriptions.length} subscriptions
          </Badge>
        </Group>

        <Divider />

        {/* Add New Monthly Payment Form */}
        <Card withBorder p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}>
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon size="sm" radius="md" variant="light" color="blue">
                <IconPlus size="0.9rem" />
              </ThemeIcon>
              <Text fw={600} size="sm">Add New Subscription</Text>
            </Group>
            <Grid gutter="sm">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Input
                  value={addPaymentName}
                  onChange={(e) => setAddPaymentName(e.target.value)}
                  placeholder="Subscription name (e.g. Netflix)"
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 2 }}>
                <NumberInput
                  value={addPaymentAmount}
                  onChange={setAddPaymentAmount}
                  placeholder="Amount"
                  size="sm"
                  min={0}
                  decimalScale={2}
                  fixedDecimalScale
                  prefix="£"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 2 }}>
                <Select
                  value={addPaymentFrequency}
                  onChange={setAddPaymentFrequency}
                  placeholder="Frequency"
                  data={BillingFrequencyOptions}
                  size="sm"
                  comboboxProps={{
                    transitionProps: { transition: 'pop', duration: 200 }
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 1.5 }}>
                <NumberInput
                  value={addPaymentBillingDate}
                  onChange={setAddPaymentBillingDate}
                  placeholder="Day"
                  size="sm"
                  min={1}
                  max={31}
                />
              </Grid.Col>
              {Number(addPaymentFrequency) === BillingFrequency.Yearly && (
                <Grid.Col span={{ base: 6, md: 1.5 }}>
                  <NumberInput
                    value={addPaymentBillingMonth}
                    onChange={setAddPaymentBillingMonth}
                    placeholder="Month"
                    size="sm"
                    min={1}
                    max={12}
                  />
                </Grid.Col>
              )}
              <Grid.Col span={{ base: 12, md: 1 }}>
                <Button
                  onClick={handleAddSubscription}
                  size="sm"
                  leftSection={<IconPlus size="1rem" />}
                  disabled={!addPaymentName || !addPaymentAmount}
                  fullWidth
                >
                  Add
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Monthly Payments Table */}
        <div style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Subscription Name</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Billing Day</Table.Th>
                <Table.Th>Billing Month</Table.Th>
                <Table.Th>Frequency</Table.Th>
                <Table.Th>Next Billing Date</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {subscriptionsData.subscriptions.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Center py="md">
                      <Text size="sm" c="dimmed">No subscriptions configured yet</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                subscriptionsData.subscriptions.map((subscription) => {
                  const edited = editedSubscriptions[subscription.id] || {}
                  const currentValues = { ...subscription, ...edited }

                  return <Table.Tr key={subscription.id}>
                    <Table.Td>
                      <Input
                        value={currentValues.name}
                        onChange={(e) => setEditedSubscriptions(prev => ({
                          ...prev,
                          [subscription.id]: { ...prev[subscription.id], name: e.target.value }
                        }))}
                        size="sm"
                      />
                    </Table.Td>
                    <Table.Td w="12%">
                      <NumberInput
                        value={currentValues.amount}
                        onChange={(value) => setEditedSubscriptions(prev => ({
                          ...prev,
                          [subscription.id]: { ...prev[subscription.id], amount: Number(value) }
                        }))}
                        size="sm"
                        min={0}
                        decimalScale={2}
                        fixedDecimalScale
                        prefix="£"
                      />
                    </Table.Td>
                    <Table.Td w="10%">
                      <NumberInput
                        value={currentValues.billingDay}
                        onChange={(value) => setEditedSubscriptions(prev => ({
                          ...prev,
                          [subscription.id]: { ...prev[subscription.id], billingDay: Number(value) }
                        }))}
                        size="sm"
                        min={1}
                        max={31}
                      />
                    </Table.Td>
                    <Table.Td w="10%">
                      {currentValues.billingFrequency === BillingFrequency.Yearly ? (
                        <NumberInput
                          value={currentValues.billingMonth || 1}
                          onChange={(value) => setEditedSubscriptions(prev => ({
                            ...prev,
                            [subscription.id]: { ...prev[subscription.id], billingMonth: Number(value) }
                          }))}
                          size="sm"
                          min={1}
                          max={12}
                        />
                      ) : (
                        <Text size="sm" c="dimmed">-</Text>
                      )}
                    </Table.Td>
                    <Table.Td w="15%">
                      <Select
                        value={currentValues.billingFrequency.toString()}
                        onChange={(value) => setEditedSubscriptions(prev => ({
                          ...prev,
                          [subscription.id]: { ...prev[subscription.id], billingFrequency: Number(value) as BillingFrequency }
                        }))}
                        data={BillingFrequencyOptions}
                        size="sm"
                        comboboxProps={{
                          transitionProps: { transition: 'pop', duration: 200 }
                        }}
                      />
                    </Table.Td>
                    <Table.Td w="15%">
                      <Text size="sm" c="dimmed">
                        {new Date(currentValues.nextBillingDate).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Group gap="xs" justify="flex-end" wrap="nowrap">
                        <Tooltip label="Save changes">
                          <ActionIcon
                            variant="light"
                            color="green"
                            size="lg"
                            onClick={() => {
                              void handleSaveSubscription(currentValues as SubscriptionItem)
                              setEditedSubscriptions(prev => {
                                const newState = { ...prev }
                                delete newState[subscription.id]
                                return newState
                              })
                            }}
                          >
                            <IconDeviceFloppy size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete subscription">
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="lg"
                            onClick={() => { void handleDeleteClick(subscription.id) }}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                })
              )}
            </Table.Tbody>
          </Table>
        </div>

        {/* Monthly Payment Summary */}
        {subscriptionsData.subscriptions.length > 0 && (
          <Card withBorder p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}>
            <Group justify="space-between">
              <Text fw={600}>Total Monthly Subscriptions:</Text>
              <Text fw={700} size="lg" c="violet">
                £{subscriptionsData.subscriptions
                  .reduce((acc, p) => acc + p.monthlyAmount, 0)
                  .toFixed(2)}/month
              </Text>
            </Group>
          </Card>
        )}
      </Stack>
    </Card>
  )
}
