'use client'

import { doPost, doQueryGet } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { GetAddMonthPotDataDto } from '@/interfaces/api/pots/GetAddMonthPotDataDto'
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
  NumberInput
} from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
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
      }))
    }

    const res = await doPost('/api/Month/AddNewMonth', { body: reqBody })

    if (res.ok) {
      props.hideModal()
      queryClient.invalidateQueries({ queryKey: ['addMonthPotData'] })
      queryClient.invalidateQueries({ queryKey: ['homepage-stats'] })
      queryClient.invalidateQueries({ queryKey: ['potBreakdownData'] })
      queryClient.invalidateQueries({ queryKey: ['thisMonthTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['unprocessedTransactions'] })
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

              <Divider />

              <Group justify="space-between">
                <Text fw={600} size="lg">Spare Money:</Text>
                <Text
                  fw={700}
                  size="lg"
                  c={(Number(incomeForMonth) - data.spendingPots.reduce((acc, pot) => acc + (pot.amountToAdd), 0) - data.savingsPots.reduce((acc, pot) => acc + (pot.amountToAdd), 0)) >= 0 ? 'green' : 'red'}
                >
                  {`£${(Number(incomeForMonth) - data.spendingPots.reduce((acc, pot) => acc + (pot.amountToAdd), 0) - data.savingsPots.reduce((acc, pot) => acc + (pot.amountToAdd), 0)).toFixed(2)}`}
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
