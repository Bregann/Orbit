'use client'

import { doPost, doQueryGet } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { GetAddMonthPotDataDto } from '@/interfaces/api/pots/GetAddMonthPotDataDto'
import { GetSubscriptionsDto } from '@/interfaces/api/subscriptions/GetSubscriptionsDto'
import { BillingFrequency, SubscriptionItem } from '@/interfaces/api/subscriptions/MonthlyPayment'
import {
  Modal,
  Button,
  Group,
  Grid,
  Text,
  Title,
  Divider,
  Stack,
  Paper,
  Checkbox,
  NumberInput,
  Badge,
  ThemeIcon
} from '@mantine/core'
import { IconCheck, IconX, IconCalendarRepeat } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export interface AddNewMonthModalProps {
  displayModal: boolean
  hideModal: () => void
}

const AddNewMonthModal = (props: AddNewMonthModalProps) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['addMonthPotData'],
    queryFn: async () => await doQueryGet<GetAddMonthPotDataDto>('/api/pots/GetAddMonthPotData')
  })

  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['getSubscriptions'],
    queryFn: async () => await doQueryGet<GetSubscriptionsDto>('/api/subscriptions/GetSubscriptions')
  })

  const [incomeForMonth, setIncomeForMonth] = useState<number | string>('')
  const [potRollovers, setPotRollovers] = useState<{ [key: number]: boolean }>({})

  const updateSpendingPotAmountAllocatedAmount = (potId: number, amount: number) => {
    queryClient.setQueryData<GetAddMonthPotDataDto>(['addMonthPotData'], (oldData) => {
      if (oldData === undefined) {
        return
      }
      const updatedPots = oldData.spendingPots.map((pot) => {
        if (pot.potId === potId) {
          return { ...pot, amountToAdd: amount }
        }
        return pot
      })
      return { ...oldData, spendingPots: updatedPots }
    })
  }

  const updateSavingsPotAmountAllocatedAmount = (potId: number, amount: number) => {
    queryClient.setQueryData<GetAddMonthPotDataDto>(['addMonthPotData'], (oldData) => {
      if (oldData === undefined) {
        return
      }
      const updatedPots = oldData.savingsPots.map((pot) => {
        if (pot.potId === potId) {
          return { ...pot, amountToAdd: amount }
        }
        return pot
      })
      return { ...oldData, savingsPots: updatedPots }
    })
  }

  const addNewMonth = async () => {
    // Get monthly subscriptions for this month
    const subscriptions = subscriptionsData?.subscriptions
      .map((s: SubscriptionItem) => ({
        subscriptionId: s.id,
        amount: s.amount,
        billingFrequency: s.billingFrequency
      })) ?? []

    const reqBody = {
      monthlyIncome: incomeForMonth,
      potIdsToRollover: Object.keys(potRollovers).filter((potId) => potRollovers[Number(potId)] === true).map(Number),
      spendingPots: data?.spendingPots.map((pot) => ({
        potId: pot.potId,
        amountToAdd: pot.amountToAdd
      })),
      savingsPots: data?.savingsPots.map((pot) => ({
        potId: pot.potId,
        amountToAdd: pot.amountToAdd
      })),
      subscriptions: subscriptions
    }

    const res = await doPost('/api/Month/AddNewMonth', { body: reqBody })

    if (res.ok) {
      props.hideModal()
      queryClient.invalidateQueries({ queryKey: ['addMonthPotData'] })
      queryClient.invalidateQueries({ queryKey: ['homepage-stats'] })
      queryClient.invalidateQueries({ queryKey: ['potBreakdownData'] })
      queryClient.invalidateQueries({ queryKey: ['thisMonthTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['unprocessedTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['monthlyPaymentsForMonth'] })
      setPotRollovers([])
      setIncomeForMonth('')

      notificationHelper.showSuccessNotification('Success', 'New month added successfully!', 3000, <IconCheck />)
    }
    else {
      notificationHelper.showErrorNotification('Error', 'Failed to add new month.', 3000, <IconX />)
    }
  }

  return (
    <Modal
      opened={props.displayModal}
      onClose={() => { props.hideModal(); queryClient.invalidateQueries({ queryKey: ['addMonthPotData'] }); setPotRollovers([]) }}
      title="Add New Month"
      size="lg"
      centered
      closeOnClickOutside={false}
    >
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error loading data</div>}
      {data !== undefined &&
        <Stack gap="md">
          <NumberInput
            label="Income This Month"
            placeholder="Enter your income"
            value={incomeForMonth}
            onChange={setIncomeForMonth}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator=","
            prefix="£"
            size="md"
          />

          <div>
            <Title order={4} mb="sm">Spending Pots</Title>
            <Grid gutter="sm">
              {data.spendingPots.map((pot) => (
                <Grid.Col span={6} key={pot.potId}>
                  <Paper withBorder p="md" radius="md" ta="center">
                    <Stack gap="xs">
                      <div>
                        <Text fw={500} size="md">{pot.potName}</Text>
                        <NumberInput
                          value={pot.amountToAdd}
                          onChange={(value) => { updateSpendingPotAmountAllocatedAmount(pot.potId, Number(value)) }}
                          min={0}
                          decimalScale={2}
                          fixedDecimalScale
                          thousandSeparator=","
                          prefix="£"
                          size="sm"
                          styles={{
                            input: {
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: '16px'
                            }
                          }}
                        />
                      </div>

                      <div>
                        <Text size="sm" c="dimmed" mb="xs">
                          Rollover available: {pot.rolloverAmount}
                        </Text>
                        <Checkbox
                          checked={potRollovers[pot.potId] || false}
                          onChange={() => { setPotRollovers((prev) => ({ ...prev, [pot.potId]: !prev[pot.potId] })) }}
                          label="Include rollover"
                          size="sm"
                        />
                      </div>
                    </Stack>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </div>

          {/* Savings Pots */}
          <div>
            <Title order={4} mb="sm">Savings Pots</Title>
            <Grid gutter="sm">
              {data.savingsPots.map((pot) => (
                <Grid.Col span={6} key={pot.potId}>
                  <Paper withBorder p="md" radius="md" ta="center">
                    <Text fw={500} size="sm" truncate>
                      {pot.potName}
                    </Text>
                    <NumberInput
                      value={pot.amountToAdd}
                      onChange={(value) => { updateSavingsPotAmountAllocatedAmount(pot.potId, Number(value)) }}
                      min={0}
                      decimalScale={2}
                      fixedDecimalScale
                      thousandSeparator=","
                      prefix="£"
                      size="sm"
                      styles={{
                        input: {
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: '16px'
                        }
                      }}
                    />
                    <Text size="xs" c="blue">
                      Savings
                    </Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </div>

          {/* Monthly Payments / Subscriptions */}
          {!isLoadingSubscriptions && subscriptionsData && subscriptionsData.subscriptions.length > 0 && (
            <div>
              <Group justify="space-between" align="center" mb="sm">
                <Group gap="xs">
                  <ThemeIcon size="sm" radius="md" variant="light" color="grape">
                    <IconCalendarRepeat size="0.9rem" />
                  </ThemeIcon>
                  <Title order={4}>Monthly Subscriptions</Title>
                </Group>
                <Badge size="sm" variant="light" color="grape">
                  {subscriptionsData.subscriptions.length} subscriptions
                </Badge>
              </Group>

              <Paper withBorder p="md" radius="md">
                <Stack gap="xs">
                  {subscriptionsData.subscriptions
                    .map((subscription: SubscriptionItem) => (
                      <Group key={subscription.id} justify="space-between">
                        <Text size="sm">{subscription.name}</Text>
                        <Group gap="xs">
                          <Badge size="xs" variant="light" color="dimmed">
                            {subscription.billingFrequency === BillingFrequency.Monthly ? 'Monthly' : 'Yearly'}
                          </Badge>
                          <Text size="sm" fw={600}>£{subscription.amount.toFixed(2)}</Text>
                          <Text size="sm" fw={600} c="grape">(£{subscription.monthlyAmount.toFixed(2)}/mo)</Text>
                        </Group>
                      </Group>
                    ))}
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>Total Subscriptions:</Text>
                    <Text size="sm" fw={700} c="grape">
                      £{subscriptionsData.subscriptions
                        .reduce((acc: number, s: SubscriptionItem) => acc + s.monthlyAmount, 0)
                        .toFixed(2)}/month
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            </div>
          )}

          <Divider />

          {/* Summary */}
          <Paper withBorder p="md" radius="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text>Monthly Income:</Text>
                <Text fw={500}>
                  {typeof incomeForMonth === 'number' ? `£${incomeForMonth.toFixed(2)}` : '£0.00'}
                </Text>
              </Group>

              <Group justify="space-between">
                <Text>Total Pot Allocations:</Text>
                <Text fw={500}>
                  £{(data.spendingPots.reduce((acc, pot) => acc + (pot.amountToAdd), 0) + data.savingsPots.reduce((acc, pot) => acc + (pot.amountToAdd), 0)).toFixed(2)}
                </Text>
              </Group>

              {subscriptionsData && subscriptionsData.subscriptions.length > 0 && (
                <Group justify="space-between">
                  <Text>Monthly Subscriptions:</Text>
                  <Text fw={500} c="grape">
                    £{subscriptionsData.subscriptions
                      .reduce((acc: number, s: SubscriptionItem) => acc + s.monthlyAmount, 0)
                      .toFixed(2)}
                  </Text>
                </Group>
              )}

              <Divider />

              <Group justify="space-between">
                <Text fw={600} size="lg">Spare Money:</Text>
                <Text
                  fw={700}
                  size="lg"
                  c={(() => {
                    const potAllocations = data.spendingPots.reduce((acc, pot) => acc + pot.amountToAdd, 0) + data.savingsPots.reduce((acc, pot) => acc + pot.amountToAdd, 0)
                    const subscriptionTotal = subscriptionsData
                      ? subscriptionsData.subscriptions.reduce((acc: number, s: SubscriptionItem) => acc + s.monthlyAmount, 0)
                      : 0
                    return (Number(incomeForMonth) - potAllocations - subscriptionTotal) >= 0 ? 'green' : 'red'
                  })()}
                >
                  {(() => {
                    const potAllocations = data.spendingPots.reduce((acc, pot) => acc + pot.amountToAdd, 0) + data.savingsPots.reduce((acc, pot) => acc + pot.amountToAdd, 0)
                    const subscriptionTotal = subscriptionsData
                      ? subscriptionsData.subscriptions.reduce((acc: number, s: SubscriptionItem) => acc + s.monthlyAmount, 0)
                      : 0
                    return `£${(Number(incomeForMonth) - potAllocations - subscriptionTotal).toFixed(2)}`
                  })()}
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* Action Buttons */}
          <Group justify="center" mt="md">
            <Button
              color="green"
              onClick={async () => { await addNewMonth() }}
              disabled={incomeForMonth === '' || typeof incomeForMonth === 'string'}
              size="md"
            >
            Add Month
            </Button>
            <Button
              color="red"
              variant="outline"
              onClick={() => { props.hideModal(); queryClient.invalidateQueries({ queryKey: ['addMonthPotData'] }); setPotRollovers([]) } }
              size="md"
            >
            Cancel
            </Button>
          </Group>
        </Stack>
      }
    </Modal>
  )
}

export default AddNewMonthModal
