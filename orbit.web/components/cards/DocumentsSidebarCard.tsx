'use client'

import { Stack, Card, Text, Group, ThemeIcon, Title, Divider, Badge } from '@mantine/core'
import { IconCalendar, IconFolder } from '@tabler/icons-react'
import type { DocumentItem } from '@/interfaces/api/documents/GetAllDocumentsDto'
import type { DocumentCategoryItem } from '@/interfaces/api/documents/GetAllDocumentCategoriesDto'
import { IconFileTypePdf, IconPhoto, IconFileSpreadsheet, IconFileText } from '@tabler/icons-react'

interface DocumentsSidebarCardProps {
  documents: DocumentItem[]
  categories: DocumentCategoryItem[]
  onDownload: (_documentId: number) => void
}

export default function DocumentsSidebarCard({ documents, categories, onDownload }: DocumentsSidebarCardProps) {
  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('pdf')) return <IconFileTypePdf size="1.2rem" />
    if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) return <IconPhoto size="1.2rem" />
    if (lowerType.includes('sheet') || lowerType.includes('xls')) return <IconFileSpreadsheet size="1.2rem" />
    return <IconFileText size="1.2rem" />
  }

  const getFileIconColor = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('pdf')) return 'red'
    if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) return 'green'
    if (lowerType.includes('sheet') || lowerType.includes('xls')) return 'teal'
    return 'blue'
  }

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5)

  return (
    <Stack gap="md">
      {/* Recent Uploads */}
      <Card withBorder p="lg" radius="md" shadow="sm">
        <Group gap="xs" mb="md">
          <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
            <IconCalendar size="1.2rem" />
          </ThemeIcon>
          <Title order={4} size="h5">Recent Uploads</Title>
        </Group>
        <Divider mb="md" />
        <Stack gap="xs">
          {recentDocuments.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No documents uploaded yet
            </Text>
          ) : (
            recentDocuments.map(doc => (
              <Group
                key={doc.documentId}
                justify="space-between"
                wrap="nowrap"
                style={{ cursor: 'pointer' }}
                onClick={() => onDownload(doc.documentId)}
              >
                <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <ThemeIcon size="sm" radius="sm" variant="light" color={getFileIconColor(doc.documentType)}>
                    {getFileIcon(doc.documentType)}
                  </ThemeIcon>
                  <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{doc.documentName}</Text>
                </Group>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </Text>
              </Group>
            ))
          )}
        </Stack>
      </Card>

      {/* Categories Overview */}
      <Card withBorder p="lg" radius="md" shadow="sm">
        <Group gap="xs" mb="md">
          <ThemeIcon size="lg" radius="md" variant="light" color="violet">
            <IconFolder size="1.2rem" />
          </ThemeIcon>
          <Title order={4} size="h5">Categories</Title>
        </Group>
        <Divider mb="md" />
        <Stack gap="xs">
          {categories.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No categories yet
            </Text>
          ) : (
            categories.map(category => {
              const categoryDocs = documents.filter(d => d.categoryId === category.id)
              return (
                <Group key={category.id} justify="space-between">
                  <Text size="sm">{category.categoryName}</Text>
                  <Badge variant="light" color={categoryDocs.length > 0 ? 'blue' : 'gray'}>
                    {categoryDocs.length}
                  </Badge>
                </Group>
              )
            })
          )}
        </Stack>
      </Card>
    </Stack>
  )
}
