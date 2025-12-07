'use client'

import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Badge,
  TextInput,
  ActionIcon,
  Divider,
  ThemeIcon,
  Select,
  Modal,
  FileInput,
  Table,
  Tooltip
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconPlus,
  IconTrash,
  IconDownload,
  IconEye,
  IconFiles,
  IconFolder,
  IconFileText,
  IconPhoto,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconCategory,
  IconX,
  IconEdit,
  IconUpload,
  IconSearch,
  IconCalendar
} from '@tabler/icons-react'

// Mock data - replace with real data later
const mockDocuments = [
  { id: 1, name: 'Tax Return 2024.pdf', category: 'Tax', size: '2.4 MB', uploadedAt: '2025-11-15', type: 'pdf' },
  { id: 2, name: 'House Insurance Policy.pdf', category: 'Insurance', size: '1.8 MB', uploadedAt: '2025-10-22', type: 'pdf' },
  { id: 3, name: 'Car Registration.pdf', category: 'Vehicle', size: '856 KB', uploadedAt: '2025-09-10', type: 'pdf' },
  { id: 4, name: 'Passport Scan.jpg', category: 'Identity', size: '1.2 MB', uploadedAt: '2025-08-05', type: 'image' },
  { id: 5, name: 'Mortgage Agreement.pdf', category: 'Property', size: '4.5 MB', uploadedAt: '2025-07-20', type: 'pdf' },
  { id: 6, name: 'Bank Statement Nov.pdf', category: 'Financial', size: '320 KB', uploadedAt: '2025-11-28', type: 'pdf' },
  { id: 7, name: 'Medical Records.pdf', category: 'Medical', size: '1.1 MB', uploadedAt: '2025-06-15', type: 'pdf' },
  { id: 8, name: 'Budget Spreadsheet.xlsx', category: 'Financial', size: '245 KB', uploadedAt: '2025-11-01', type: 'spreadsheet' },
]

const defaultCategories = ['Tax', 'Insurance', 'Vehicle', 'Identity', 'Property', 'Financial', 'Medical', 'Warranty', 'Receipts']

export default function DocumentsComponent() {
  const [documents, setDocuments] = useState(mockDocuments)
  const [categories, setCategories] = useState(defaultCategories)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false)
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false)

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState<string | null>(null)
  const [uploadName, setUploadName] = useState('')

  // New category form state
  const [newCategoryName, setNewCategoryName] = useState('')

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <IconFileTypePdf size="1.2rem" />
      case 'image': return <IconPhoto size="1.2rem" />
      case 'spreadsheet': return <IconFileSpreadsheet size="1.2rem" />
      default: return <IconFileText size="1.2rem" />
    }
  }

  const getFileIconColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'red'
      case 'image': return 'green'
      case 'spreadsheet': return 'teal'
      default: return 'blue'
    }
  }

  const handleUpload = () => {
    if (!uploadFile && !uploadName.trim()) return

    const newDoc = {
      id: Math.max(...documents.map(d => d.id), 0) + 1,
      name: uploadName.trim() || uploadFile?.name || 'Untitled Document',
      category: uploadCategory || categories[0] || 'General',
      size: uploadFile ? `${(uploadFile.size / 1024).toFixed(0)} KB` : '0 KB',
      uploadedAt: new Date().toISOString().split('T')[0],
      type: uploadFile?.type.includes('pdf') ? 'pdf' :
        uploadFile?.type.includes('image') ? 'image' :
          uploadFile?.type.includes('sheet') ? 'spreadsheet' : 'document'
    }

    setDocuments([...documents, newDoc])
    setUploadFile(null)
    setUploadCategory(null)
    setUploadName('')
    closeUploadModal()
  }

  const deleteDocument = (docId: number) => {
    setDocuments(documents.filter(doc => doc.id !== docId))
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    if (categories.includes(newCategoryName.trim())) return

    setCategories([...categories, newCategoryName.trim()])
    setNewCategoryName('')
  }

  const handleDeleteCategory = (categoryToDelete: string) => {
    const docsUsingCategory = documents.filter(d => d.category === categoryToDelete)
    if (docsUsingCategory.length > 0) {
      return
    }
    setCategories(categories.filter(c => c !== categoryToDelete))
    if (selectedCategory === categoryToDelete) {
      setSelectedCategory('All')
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const categoryMatch = selectedCategory === 'All' || doc.category === selectedCategory
    const searchMatch = searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  const totalSize = documents.reduce((acc, doc) => {
    const size = parseFloat(doc.size)
    const unit = doc.size.includes('MB') ? 1024 : 1
    return acc + (size * unit)
  }, 0)

  const formatTotalSize = () => {
    if (totalSize >= 1024) {
      return `${(totalSize / 1024).toFixed(1)} MB`
    }
    return `${totalSize.toFixed(0)} KB`
  }

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5)

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Documents
            </Title>
            <Text c="dimmed" size="sm">
              Your personal document vault - securely store and organize important files
            </Text>
          </div>
          <Button
            leftSection={<IconUpload size="1rem" />}
            onClick={openUploadModal}
          >
            Upload Document
          </Button>
        </Group>

        {/* Stats Cards */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
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
                <Text size="sm" c="dimmed" fw={500}>Storage Used</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconFileText size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{formatTotalSize()}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>This Month</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                  <IconCalendar size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {documents.filter(d => {
                  const docDate = new Date(d.uploadedAt)
                  const now = new Date()
                  return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear()
                }).length}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Search and Filters */}
        <Card withBorder p="md" radius="md" shadow="sm">
          <Stack gap="md">
            <TextInput
              placeholder="Search documents..."
              leftSection={<IconSearch size="1rem" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
            <Group justify="space-between" wrap="wrap" gap="md">
              <Group gap="sm" wrap="wrap">
                <Button
                  variant={selectedCategory === 'All' ? 'filled' : 'light'}
                  size="xs"
                  onClick={() => setSelectedCategory('All')}
                >
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'filled' : 'light'}
                    size="xs"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="sm"
                  onClick={openCategoryModal}
                  title="Manage Categories"
                >
                  <IconCategory size="1rem" />
                </ActionIcon>
              </Group>
              <Badge variant="light">{filteredDocuments.length} documents</Badge>
            </Group>
          </Stack>
        </Card>

        {/* Documents List */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
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

              {filteredDocuments.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  No documents found. Upload a document to get started!
                </Text>
              ) : (
                <Table.ScrollContainer minWidth={500}>
                  <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Document</Table.Th>
                        <Table.Th>Category</Table.Th>
                        <Table.Th>Size</Table.Th>
                        <Table.Th>Uploaded</Table.Th>
                        <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredDocuments.map(doc => (
                        <Table.Tr key={doc.id}>
                          <Table.Td>
                            <Group gap="sm" wrap="nowrap">
                              <ThemeIcon size="md" radius="sm" variant="light" color={getFileIconColor(doc.type)}>
                                {getFileIcon(doc.type)}
                              </ThemeIcon>
                              <Text size="sm" lineClamp={1}>{doc.name}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge size="sm" variant="light">{doc.category}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">{doc.size}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">
                              {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Tooltip label="View">
                                <ActionIcon variant="subtle" color="blue" size="sm">
                                  <IconEye size="1rem" />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Download">
                                <ActionIcon variant="subtle" color="green" size="sm">
                                  <IconDownload size="1rem" />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Delete">
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  size="sm"
                                  onClick={() => deleteDocument(doc.id)}
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
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 4 }}>
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
                      <Group key={doc.id} justify="space-between" wrap="nowrap">
                        <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                          <ThemeIcon size="sm" radius="sm" variant="light" color={getFileIconColor(doc.type)}>
                            {getFileIcon(doc.type)}
                          </ThemeIcon>
                          <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{doc.name}</Text>
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
                <Group justify="space-between" mb="md">
                  <Group gap="xs">
                    <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                      <IconFolder size="1.2rem" />
                    </ThemeIcon>
                    <Title order={4} size="h5">By Category</Title>
                  </Group>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={openCategoryModal}
                    title="Manage Categories"
                  >
                    <IconEdit size="0.9rem" />
                  </ActionIcon>
                </Group>
                <Divider mb="md" />
                <Stack gap="xs">
                  {categories.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No categories yet
                    </Text>
                  ) : (
                    categories.map(category => {
                      const categoryDocs = documents.filter(d => d.category === category)
                      return (
                        <Group key={category} justify="space-between">
                          <Text size="sm">{category}</Text>
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
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Upload Document Modal */}
      <Modal
        opened={uploadModalOpened}
        onClose={closeUploadModal}
        title="Upload Document"
        size="md"
      >
        <Stack gap="md">
          <FileInput
            label="Select File"
            placeholder="Choose a file to upload"
            leftSection={<IconUpload size="1rem" />}
            value={uploadFile}
            onChange={setUploadFile}
            accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
          />
          <TextInput
            label="Document Name"
            placeholder="Enter document name (optional)"
            description="Leave empty to use the file name"
            value={uploadName}
            onChange={(e) => setUploadName(e.currentTarget.value)}
          />
          <Select
            label="Category"
            placeholder="Select category"
            data={categories}
            value={uploadCategory}
            onChange={setUploadCategory}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeUploadModal}>Cancel</Button>
            <Button onClick={handleUpload} leftSection={<IconUpload size="1rem" />}>
              Upload
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Manage Categories Modal */}
      <Modal
        opened={categoryModalOpened}
        onClose={closeCategoryModal}
        title="Manage Categories"
        size="md"
      >
        <Stack gap="md">
          <Group gap="xs">
            <TextInput
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.currentTarget.value)}
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategory()
              }}
            />
            <Button onClick={handleAddCategory} leftSection={<IconPlus size="1rem" />}>
              Add
            </Button>
          </Group>

          <Divider />

          <Stack gap="xs">
            {categories.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No categories yet. Add one above!
              </Text>
            ) : (
              categories.map(category => {
                const docCount = documents.filter(d => d.category === category).length
                return (
                  <Card key={category} withBorder p="xs" radius="sm">
                    <Group justify="space-between">
                      <Group gap="sm">
                        <Text size="sm" fw={500}>{category}</Text>
                        <Badge size="xs" variant="light">
                          {docCount} {docCount === 1 ? 'document' : 'documents'}
                        </Badge>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={docCount > 0}
                        title={docCount > 0 ? 'Cannot delete category with documents' : 'Delete category'}
                      >
                        <IconX size="1rem" />
                      </ActionIcon>
                    </Group>
                  </Card>
                )
              })
            )}
          </Stack>

          <Text size="xs" c="dimmed">
            Note: Categories with documents cannot be deleted. Remove or reassign documents first.
          </Text>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeCategoryModal}>Close</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
