import { SpendingPotData } from '@/interfaces/api/pots/GetAllPotDataDto'
import { Card, Stack, Text, Progress, Group, Divider } from '@mantine/core'

interface SpendingPotCardProps {
  data: SpendingPotData
}

export const SpendingPotCard = ({ data }: SpendingPotCardProps) => {
  // Parse the amounts (assuming they're in format like "£123.45")
  const parseAmount = (amount: string | number) => {
    if (typeof amount === 'number') return amount
    const parsed = parseFloat(amount.toString().replace(/[^0-9.-]/g, ''))
    return isNaN(parsed) ? 0 : parsed
  }

  const allocated = parseAmount(data.amountAllocated)
  const spent = parseAmount(data.amountSpent)
  const spentPercentage = allocated > 0 ? (spent / allocated) * 100 : 0

  return (
    <Card withBorder p="md" radius="md" shadow="sm" h="100%">
      <Stack gap="md">
        <Text fw={600} size="lg" ta="center">{data.potName}</Text>
        <Divider />
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Allocated</Text>
            <Text size="sm" fw={500}>{data.amountAllocated}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="red">Spent</Text>
            <Text size="sm" fw={600} c="red">{data.amountSpent}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="green">Remaining</Text>
            <Text size="sm" fw={600} c="green">{data.amountLeft}</Text>
          </Group>
        </Stack>
        <Progress
          value={spentPercentage}
          color={spentPercentage > 90 ? 'red' : spentPercentage > 70 ? 'orange' : 'blue'}
          size="lg"
          radius="md"
        />
        <Text size="xs" c="dimmed" ta="center">
          {spentPercentage.toFixed(1)}% spent
        </Text>
      </Stack>
    </Card>
  )
}
