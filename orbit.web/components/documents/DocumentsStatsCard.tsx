'use client'

import { Grid, Card, Text, Group, ThemeIcon } from '@mantine/core'
import { IconFiles, IconFolder, IconCalendar } from '@tabler/icons-react'
import type { DocumentItem } from '@/interfaces/api/documents/GetAllDocumentsDto'
import type { DocumentCategoryItem } from '@/interfaces/api/documents/GetAllDocumentCategoriesDto'

interface DocumentsStatsCardProps {
  documents: DocumentItem[]
  categories: DocumentCategoryItem[]
}

export default function DocumentsStatsCard({ documents, categories }: DocumentsStatsCardProps) {
  const thisMonth = documents.filter(d => {
    const docDate = new Date(d.uploadedAt)
    const now = new Date()
    return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>Total Documents</Text>
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconFiles size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{documents.length}</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
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

      <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>This Month</Text>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconCalendar size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{thisMonth}</Text>
        </Card>
      </Grid.Col>
    </Grid>
  )
}
