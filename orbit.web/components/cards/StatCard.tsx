import { Card, Stack, Text, Group, ThemeIcon } from '@mantine/core'
import { IconCurrencyPound } from '@tabler/icons-react'

interface StatCardProps {
  title: string
  amount: number
}

const StatCard = (props: StatCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getColorByTitle = (title: string) => {
    if (title.includes('Money In')) return 'green'
    if (title.includes('Money Spent')) return 'red'
    if (title.includes('Money Left')) return 'blue'
    if (title.includes('Savings')) return 'violet'
    if (title.includes('Spending Pots')) return 'orange'
    return 'gray'
  }

  const color = getColorByTitle(props.title)

  return (
    <Card withBorder p="md" radius="md" shadow="sm" h="100%">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Text size="sm" c="dimmed" fw={500} style={{ flex: 1 }}>
            {props.title}
          </Text>
          <ThemeIcon size="sm" radius="md" color={color} variant="light">
            <IconCurrencyPound size="0.9rem" />
          </ThemeIcon>
        </Group>
        <Text size="xl" fw={700} c={color}>
          {formatCurrency(props.amount)}
        </Text>
      </Stack>
    </Card>
  )
}

export default StatCard
