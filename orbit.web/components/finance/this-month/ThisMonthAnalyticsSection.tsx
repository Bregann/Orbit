'use client'

import {
  Card,
  Grid,
  Group,
  Title,
  Stack,
  Text,
  ThemeIcon
} from '@mantine/core'
import {
  IconChartBar,
  IconTrendingUp
} from '@tabler/icons-react'

const StatsPlaceholder = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
  <Card withBorder p="lg" radius="md" shadow="sm" h={220}>
    <Stack align="center" justify="center" h="100%" gap="md">
      {icon && (
        <ThemeIcon size="xl" radius="md" variant="light" color="blue">
          {icon}
        </ThemeIcon>
      )}
      <Text fw={600} size="lg" ta="center">{title}</Text>
      <Text size="sm" c="dimmed" ta="center">Chart visualization coming soon</Text>
    </Stack>
  </Card>
)

export default function ThisMonthAnalyticsSection() {
  return (
    <>
      {/* Savings Progress Over Time */}
      <div>
        <Group justify="space-between" align="center" mb="md">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="teal">
              <IconTrendingUp size="1.2rem" />
            </ThemeIcon>
            <Title order={2} size="h3">
              Savings Progress Over Time
            </Title>
          </Group>
        </Group>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <StatsPlaceholder title="Emergency Fund - 12 Month Trend" icon={<IconTrendingUp size="1.5rem" />} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <StatsPlaceholder title="Holiday Fund - 12 Month Trend" icon={<IconTrendingUp size="1.5rem" />} />
          </Grid.Col>
          <Grid.Col span={12}>
            <StatsPlaceholder title="All Savings Pots - Monthly Comparison" icon={<IconChartBar size="1.5rem" />} />
          </Grid.Col>
        </Grid>
      </div>

      {/* Stats Breakdown */}
      <div>
        <Group justify="space-between" align="center" mb="md">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
              <IconChartBar size="1.2rem" />
            </ThemeIcon>
            <Title order={2} size="h3">
              Analytics & Insights
            </Title>
          </Group>
        </Group>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatsPlaceholder title="Spent Per Pot" icon={<IconChartBar size="1.5rem" />} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatsPlaceholder title="Top Places Money Spent" icon={<IconChartBar size="1.5rem" />} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <StatsPlaceholder title="Most Expensive Purchases" icon={<IconChartBar size="1.5rem" />} />
          </Grid.Col>
        </Grid>
      </div>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StatsPlaceholder title="Weekly Spending Trend" icon={<IconTrendingUp size="1.5rem" />} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StatsPlaceholder title="Category Comparison" icon={<IconChartBar size="1.5rem" />} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <StatsPlaceholder title="Budget vs Actual" icon={<IconChartBar size="1.5rem" />} />
        </Grid.Col>
      </Grid>

      <Card withBorder p="lg" radius="md" shadow="sm">
        <Stack align="center" justify="center" gap="md" py="xl">
          <ThemeIcon size={60} radius="md" variant="light" color="indigo">
            <IconChartBar size="2rem" />
          </ThemeIcon>
          <Text fw={600} size="xl">Daily Money Spent</Text>
          <Text size="sm" c="dimmed" ta="center">Daily spending chart will be displayed here</Text>
        </Stack>
      </Card>
    </>
  )
}
