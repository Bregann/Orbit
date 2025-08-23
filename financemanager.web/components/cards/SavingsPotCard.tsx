import { SavingsPotData } from '@/interfaces/api/pots/GetAllPotDataDto'
import { ActionIcon, Paper, Stack, Text, Tooltip } from '@mantine/core'
import { IconPencil } from '@tabler/icons-react'

interface SavingsPotCardProps {
  data: SavingsPotData
}

export const SavingsPotCard = ({ data }: SavingsPotCardProps) => (
  <Paper withBorder p="md" radius="md" shadow="sm" style={{ minWidth: '200px', position: 'relative' }}>
    <Stack gap="sm">
      <Text fw={600} size="lg" ta="center" pr="md">{data.potName}</Text>
      <Stack gap="xs">
        <Text size="xl" fw={700} c="green" ta="center">{data.amountSaved}</Text>
        <Text size="md" c="blue" ta="center">+{data.amountAddedThisMonth} this month</Text>
      </Stack>
      <Tooltip label="Edit savings amount">
        <ActionIcon
          variant="light"
          color="blue"
          onClick={() => {}}
          style={{ position: 'absolute', top: 8, right: 8 }}
        >
          <IconPencil size={16} />
        </ActionIcon>
      </Tooltip>
    </Stack>
  </Paper>
)
