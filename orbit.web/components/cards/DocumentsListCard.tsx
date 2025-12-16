'use client'

import { Card, Text, Group, ThemeIcon, Title, Divider, Table, ActionIcon, Tooltip, Badge } from '@mantine/core'
import { IconFiles, IconDownload, IconTrash, IconFileTypePdf, IconPhoto, IconFileSpreadsheet, IconFileText } from '@tabler/icons-react'
import type { DocumentItem } from '@/interfaces/api/documents/GetAllDocumentsDto'

interface DocumentsListCardProps {
  documents: DocumentItem[]
  onDownload: (_documentId: number) => void
  onDelete: (_documentId: number) => void
  isDeletingDocument: boolean
}

export default function DocumentsListCard({ documents, onDownload, onDelete, isDeletingDocument }: DocumentsListCardProps) {
  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('pdf')) return <IconFileTypePdf size="1.2rem" />
    if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) return <IconPhoto size="1.2rem" />
    if (lowerType.includes('sheet') || lowerType.includes('xls')) return <IconFileSpreadsheet size="1.2rem" />
    return <IconFileText size="1.2rem" />
  }

  const getFileIconColour = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('pdf')) return 'red'
    if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) return 'green'
    if (lowerType.includes('sheet') || lowerType.includes('xls')) return 'teal'
    return 'blue'
  }

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon size="lg" radius="md" variant="light" color="blue">
            <IconFiles size="1.2rem" />
          </ThemeIcon>
          <Title order={3} size="h4">All Documents</Title>
        </Group>
      </Group>

      <Divider mb="md" />

      {documents.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No documents found. Upload a document to get started!
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={500}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Document</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Uploaded</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {documents.map(doc => (
                <Table.Tr key={doc.documentId}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <ThemeIcon size="md" radius="sm" variant="light" color={getFileIconColour(doc.documentType)}>
                        {getFileIcon(doc.documentType)}
                      </ThemeIcon>
                      <Text size="sm" lineClamp={1}>{doc.documentName}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light">{doc.documentType}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Download">
                        <ActionIcon variant="subtle" color="green" size="sm" onClick={() => onDownload(doc.documentId)}>
                          <IconDownload size="1rem" />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => onDelete(doc.documentId)}
                          disabled={isDeletingDocument}
                        >
                          <IconTrash size="1rem" />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Card>
  )
}
