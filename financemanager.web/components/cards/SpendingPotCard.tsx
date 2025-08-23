import { SpendingPotData } from '@/interfaces/api/pots/GetAllPotDataDto'
import { Paper, Stack, Text } from '@mantine/core'

interface SpendingPotCardProps {
  data: SpendingPotData
}

export const SpendingPotCard = ({ data }: SpendingPotCardProps) => (
  <Paper withBorder p="md" radius="md" shadow="sm">
    <Stack gap="sm">
      <Text fw={600} size="lg" ta="center">{data.potName}</Text>
      <Stack gap="xs">
        <Text size="md" ta="center">Allocated: {data.amountAllocated}</Text>
        <Text size="md" fw={500} c="green" ta="center">Amount Left: {data.amountLeft}</Text>
        <Text size="md" c="red" ta="center">Spent: {data.amountSpent}</Text>
      </Stack>
    </Stack>
  </Paper>
)
