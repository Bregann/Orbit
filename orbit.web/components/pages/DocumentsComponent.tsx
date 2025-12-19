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
  TextInput,
  ActionIcon,
  Badge,
  Loader,
  Center
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconUpload,
  IconSearch,
  IconCategory,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { doQueryGet, doPostFormData, doGetBlob } from '@/helpers/apiClient'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import type { GetAllDocumentsDto } from '@/interfaces/api/documents/GetAllDocumentsDto'
import type { GetAllDocumentCategoriesDto } from '@/interfaces/api/documents/GetAllDocumentCategoriesDto'
import UploadDocumentModal from '@/components/documents/UploadDocumentModal'
import ManageDocumentCategoriesModal from '@/components/documents/ManageDocumentCategoriesModal'
import DocumentsStatsCard from '../documents/DocumentsStatsCard'
import DocumentsSidebarCard from '../documents/DocumentsSidebarCard'
import DocumentsListCard from '../documents/DocumentsListCard'
import DeleteConfirmationModal from '../common/DeleteConfirmationModal'
import { QueryKeys } from '@/helpers/QueryKeys'

export default function DocumentsComponent() {
  const [selectedCategory, setSelectedCategory] = useState<number | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false)
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [isUploading, setIsUploading] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null)

  const queryClient = useQueryClient()

  const { data: documentsData, isLoading: isLoadingDocuments } = useQuery({
    queryKey: [QueryKeys.Documents],
    queryFn: async () => await doQueryGet<GetAllDocumentsDto>('/api/documents/GetAllDocuments')
  })

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: [QueryKeys.DocumentCategories],
    queryFn: async () => await doQueryGet<GetAllDocumentCategoriesDto>('/api/documents/GetAllDocumentCategories')
  })

  const documents = documentsData?.documents ?? []
  const categories = categoriesData?.categories ?? []

  // Delete document mutation
  const { mutate: deleteDocument, isPending: isDeletingDocument } = useMutationDelete<number, void>({
    url: (documentId) => `/api/documents/DeleteDocument?documentId=${documentId}`,
    queryKey: [QueryKeys.Documents],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Document deleted successfully', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete document', 3000, <IconX />)
    }
  })

  const handleUpload = async (file: File, documentName: string, categoryId: number) => {
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('request.DocumentName', documentName)
    formData.append('request.DocumentType', file.type || 'application/octet-stream')
    formData.append('request.CategoryId', categoryId.toString())

    const response = await doPostFormData('/api/documents/UploadDocument', formData)

    if (!response.ok) {
      throw new Error(response.statusMessage ?? 'Failed to upload document')
    }

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: [QueryKeys.Documents] })
    queryClient.invalidateQueries({ queryKey: [QueryKeys.DocumentCategories] })

    setIsUploading(false)
  }

  const handleDownload = async (documentId: number) => {
    try {
      const blob = await doGetBlob(`/api/documents/DownloadDocument?documentId=${documentId}`)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Get filename from document
      const doc = documents.find(d => d.documentId === documentId)
      a.download = doc?.documentName || 'document'

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      notificationHelper.showSuccessNotification('Success', 'Document downloaded successfully', 3000, <IconCheck />)
    } catch (error) {
      notificationHelper.showErrorNotification('Error', error instanceof Error ? error.message : 'Failed to download document', 3000, <IconX />)
    }
  }

  const handleCategoryDeleted = () => {
    if (selectedCategory !== 'All') {
      setSelectedCategory('All')
    }
  }

  const handleDeleteClick = (documentId: number) => {
    setDocumentToDelete(documentId)
    openDeleteModal()
  }

  const confirmDeleteDocument = () => {
    if (documentToDelete !== null) {
      deleteDocument(documentToDelete)
      setDocumentToDelete(null)
      closeDeleteModal()
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const categoryMatch = selectedCategory === 'All' || doc.documentId === selectedCategory
    const searchMatch = searchQuery === '' ||
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  if (isLoadingDocuments || isLoadingCategories) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    )
  }

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
        <DocumentsStatsCard documents={documents} categories={categories} />

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
                    key={category.id}
                    variant={selectedCategory === category.id ? 'filled' : 'light'}
                    size="xs"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.categoryName}
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
            <DocumentsListCard
              documents={filteredDocuments}
              onDownload={handleDownload}
              onDelete={handleDeleteClick}
              isDeletingDocument={isDeletingDocument}
            />
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <DocumentsSidebarCard documents={documents} categories={categories} onDownload={handleDownload} />
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        opened={uploadModalOpened}
        onClose={closeUploadModal}
        categories={categories}
        onUpload={handleUpload}
        isUploading={isUploading}
      />

      {/* Manage Categories Modal */}
      <ManageDocumentCategoriesModal
        opened={categoryModalOpened}
        onClose={closeCategoryModal}
        categories={categories}
        documents={documents}
        onCategoryDeleted={handleCategoryDeleted}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteDocument}
        title="Are You Sure?"
        message="Do you really want to delete this document? This action cannot be undone."
      />
    </Container>
  )
}
