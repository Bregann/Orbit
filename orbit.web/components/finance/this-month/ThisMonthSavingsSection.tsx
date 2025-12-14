'use client'

import { Grid, Group, Title, Badge, ThemeIcon } from '@mantine/core'
import { IconPigMoney } from '@tabler/icons-react'
import { SavingsPotCard } from '@/components/cards/SavingsPotCard'
import { SavingsPotData } from '@/interfaces/api/pots/GetAllPotDataDto'

interface ThisMonthSavingsSectionProps {
  savingsPots: SavingsPotData[]
}

export default function ThisMonthSavingsSection({ savingsPots }: ThisMonthSavingsSectionProps) {
  return (
    <div>
      <Group justify="space-between" align="center" mb="md">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" variant="light" color="violet">
            <IconPigMoney size="1.2rem" />
          </ThemeIcon>
          <Title order={2} size="h3">
            Savings Breakdown
          </Title>
        </Group>
        <Badge size="lg" variant="light" color="violet">
          {savingsPots.length} pots
        </Badge>
      </Group>
      <Grid gutter="md">
        {savingsPots.map((pot) => (
          <Grid.Col span={{ base: 12, sm: 6, md: savingsPots.length > 3 ? 3 : 4 }} key={pot.potId}>
            <SavingsPotCard data={pot} />
          </Grid.Col>
        ))}
      </Grid>
    </div>
  )
}
