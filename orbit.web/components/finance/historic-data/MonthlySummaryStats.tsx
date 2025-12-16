'use client'

import { Card, SimpleGrid, Group, Text, ThemeIcon } from '@mantine/core'
import {
  IconShoppingBag,
  IconPigMoney,
  IconWallet,
  IconArrowUpRight,
  IconArrowDownRight
} from '@tabler/icons-react'

interface MonthlySummaryStatsProps {
  totalSpent: number
  amountSaved: number
  amountLeftOver: number
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  trend
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  trend?: { value: number; positive: boolean }
}) => (
  <Card withBorder p="lg" radius="md" shadow="sm">
    <Group justify="space-between" mb="md">
      <ThemeIcon size="lg" radius="md" variant="light" color={color}>
        {icon}
      </ThemeIcon>
      {trend && (
        <Group gap={4}>
          {trend.positive ? (
            <IconArrowUpRight size="1rem" color="green" />
          ) : (
            <IconArrowDownRight size="1rem" color="red" />
          )}
          <Text size="sm" c={trend.positive ? 'green' : 'red'} fw={500}>
            {trend.value}%
          </Text>
        </Group>
      )}
    </Group>
    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
      {title}
    </Text>
    <Text size="xl" fw={700} mt="xs">
      {value}
    </Text>
  </Card>
)

export default function MonthlySummaryStats({
  totalSpent,
  amountSaved,
  amountLeftOver
}: MonthlySummaryStatsProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      <StatCard
        title="Total Spent"
        value={`£${totalSpent.toFixed(2)}`}
        icon={<IconShoppingBag size="1.2rem" />}
        color="red"
      />
      <StatCard
        title="Amount Saved"
        value={`£${amountSaved.toFixed(2)}`}
        icon={<IconPigMoney size="1.2rem" />}
        color="teal"
      />
      <StatCard
        title="Amount Left Over"
        value={`£${amountLeftOver.toFixed(2)}`}
        icon={<IconWallet size="1.2rem" />}
        color="blue"
      />
    </SimpleGrid>
  )
}
