'use client'

import { Grid, Group, Title, Badge, ThemeIcon } from '@mantine/core'
import { IconWallet } from '@tabler/icons-react'
import { SpendingPotCard } from '@/components/cards/SpendingPotCard'
import { SpendingPotData } from '@/interfaces/api/pots/GetAllPotDataDto'

interface ThisMonthBudgetSectionProps {
  spendingPots: SpendingPotData[]
}

export default function ThisMonthBudgetSection({ spendingPots }: ThisMonthBudgetSectionProps) {
  return (
    <div>
      <Group justify="space-between" align="center" mb="md">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" variant="light" color="blue">
            <IconWallet size="1.2rem" />
          </ThemeIcon>
          <Title order={2} size="h3">
            Monthly Budget Breakdown
          </Title>
        </Group>
        <Badge size="lg" variant="light" color="blue">
          {spendingPots.length} pots
        </Badge>
      </Group>
      <Grid gutter="md">
        {spendingPots.map((pot) => (
          <Grid.Col span={{ base: 12, sm: 6, md: spendingPots.length > 3 ? 3 : 4 }} key={pot.potId}>
            <SpendingPotCard data={pot} />
          </Grid.Col>
        ))}
      </Grid>
    </div>
  )
}
