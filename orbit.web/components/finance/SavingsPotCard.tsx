import { SavingsPotData } from '@/interfaces/api/pots/GetAllPotDataDto'
import { ActionIcon, Card, Stack, Text, Tooltip, Group, Badge, Divider, ThemeIcon } from '@mantine/core'
import { IconPencil, IconPigMoney, IconTrendingUp } from '@tabler/icons-react'

interface SavingsPotCardProps {
  data: SavingsPotData
}

export const SavingsPotCard = ({ data }: SavingsPotCardProps) => (
  <Card withBorder p="md" radius="md" shadow="sm" h="100%" style={{ position: 'relative' }}>
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Group gap="xs">
          <ThemeIcon size="md" radius="md" variant="light" color="violet">
            <IconPigMoney size="1rem" />
          </ThemeIcon>
          <Text fw={600} size="lg">{data.potName}</Text>
        </Group>
        <Tooltip label="Edit savings amount">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => {}}
          >
            <IconPencil size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider />
      <Stack gap="xs" align="center">
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Total Saved</Text>
        <Text size="2rem" fw={700} c="violet">{data.amountSaved}</Text>
      </Stack>
      <Badge
        size="lg"
        variant="light"
        color="green"
        leftSection={<IconTrendingUp size="0.9rem" />}
        fullWidth
      >
        +{data.amountAddedThisMonth} this month
      </Badge>
    </Stack>
  </Card>
)
