'use client'

import { Card, Text, Stack, Group, Badge, Divider, ScrollArea } from '@mantine/core'
import { IconAlertTriangle, IconCalendar } from '@tabler/icons-react'
import type { AssetItem } from '@/interfaces/api/assets/GetAllAssetsDto'
import type { AssetCategoryItem } from '@/interfaces/api/assets/GetAllAssetCategoriesDto'
import { getAssetStatusColor } from '@/helpers/assetOptions'

interface AssetsSidebarCardProps {
  assets: AssetItem[]
  categories: AssetCategoryItem[]
}

export default function AssetsSidebarCard({ assets, categories }: AssetsSidebarCardProps) {
  const now = new Date()
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(now.getMonth() + 3)

  const expiringWarranties = assets
    .filter(a => {
      if (!a.warrantyExpirationDate || a.status !== 'Active') return false
      const warrantyDate = new Date(a.warrantyExpirationDate)
      return warrantyDate <= threeMonthsFromNow && warrantyDate >= now
    })
    .sort((a, b) =>
      new Date(a.warrantyExpirationDate!).getTime() - new Date(b.warrantyExpirationDate!).getTime()
    )

  const recentAssets = [...assets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <Stack gap="md">
      {/* Expiring Warranties */}
      {expiringWarranties.length > 0 && (
        <Card withBorder p="md" radius="md" shadow="sm">
          <Group gap="xs" mb="md">
            <IconAlertTriangle size="1.2rem" color="orange" />
            <Text fw={600} size="sm">Expiring Warranties</Text>
          </Group>
          <ScrollArea h={200}>
            <Stack gap="sm">
              {expiringWarranties.map(asset => (
                <div key={asset.assetId}>
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500} lineClamp={1}>{asset.assetName}</Text>
                      <Text size="xs" c="dimmed">{asset.categoryName}</Text>
                    </div>
                    <Badge size="xs" color="orange">
                      {new Date(asset.warrantyExpirationDate!).toLocaleDateString()}
                    </Badge>
                  </Group>
                  <Divider mt="sm" />
                </div>
              ))}
            </Stack>
          </ScrollArea>
        </Card>
      )}

      {/* Recent Assets */}
      <Card withBorder p="md" radius="md" shadow="sm">
        <Group gap="xs" mb="md">
          <IconCalendar size="1.2rem" />
          <Text fw={600} size="sm">Recently Added</Text>
        </Group>
        <ScrollArea h={200}>
          <Stack gap="sm">
            {recentAssets.map(asset => (
              <div key={asset.assetId}>
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500} lineClamp={1}>{asset.assetName}</Text>
                    <Text size="xs" c="dimmed">{asset.categoryName}</Text>
                  </div>
                  <Badge size="xs" variant="light" color={getAssetStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                </Group>
                <Divider mt="sm" />
              </div>
            ))}
          </Stack>
        </ScrollArea>
      </Card>

      {/* Category Summary */}
      <Card withBorder p="md" radius="md" shadow="sm">
        <Text fw={600} size="sm" mb="md">Category Summary</Text>
        <Stack gap="xs">
          {categories.slice(0, 5).map(category => (
            <Group key={category.categoryId} justify="space-between">
              <Text size="sm">{category.categoryName}</Text>
              <Badge size="sm" variant="light">{category.assetCount}</Badge>
            </Group>
          ))}
        </Stack>
      </Card>
    </Stack>
  )
}
