'use client'

import { Grid, Card, Text, Group, ThemeIcon } from '@mantine/core'
import { IconDeviceLaptop, IconFolder, IconAlertCircle, IconCurrencyDollar } from '@tabler/icons-react'
import type { AssetItem } from '@/interfaces/api/assets/GetAllAssetsDto'
import type { AssetCategoryItem } from '@/interfaces/api/assets/GetAllAssetCategoriesDto'

interface AssetsStatsCardProps {
  assets: AssetItem[]
  categories: AssetCategoryItem[]
}

export default function AssetsStatsCard({ assets, categories }: AssetsStatsCardProps) {
  const activeAssets = assets.filter(a => a.status === 'Active').length

  const expiringWarranties = assets.filter(a => {
    if (!a.warrantyExpirationDate || a.status !== 'Active') return false
    const warrantyDate = new Date(a.warrantyExpirationDate)
    const now = new Date()
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(now.getMonth() + 3)
    return warrantyDate <= threeMonthsFromNow && warrantyDate >= now
  }).length

  const totalValue = assets
    .filter(a => a.status === 'Active' && a.purchasePrice)
    .reduce((sum, a) => sum + (a.purchasePrice || 0), 0)

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>Total Assets</Text>
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconDeviceLaptop size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{assets.length}</Text>
          <Text size="xs" c="dimmed" mt="xs">{activeAssets} active</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>Categories</Text>
            <ThemeIcon size="lg" radius="md" variant="light" color="violet">
              <IconFolder size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{categories.length}</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>Warranties Expiring</Text>
            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
              <IconAlertCircle size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{expiringWarranties}</Text>
          <Text size="xs" c="dimmed" mt="xs">Next 3 months</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>Total Value</Text>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconCurrencyDollar size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>£{totalValue.toFixed(2)}</Text>
          <Text size="xs" c="dimmed" mt="xs">Active assets only</Text>
        </Card>
      </Grid.Col>
    </Grid>
  )
}
