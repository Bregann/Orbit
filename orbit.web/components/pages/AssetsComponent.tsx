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
  Center,
  Select
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconPlus,
  IconSearch,
  IconCategory,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { doQueryGet, doPostFormData } from '@/helpers/apiClient'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import { useMutationPut } from '@/helpers/mutations/useMutationPut'
import notificationHelper from '@/helpers/notificationHelper'
import type { GetAllAssetsDto } from '@/interfaces/api/assets/GetAllAssetsDto'
import type { GetAllAssetCategoriesDto } from '@/interfaces/api/assets/GetAllAssetCategoriesDto'
import type { CreateAssetRequest } from '@/interfaces/api/assets/CreateAssetRequest'
import type { UpdateAssetRequest } from '@/interfaces/api/assets/UpdateAssetRequest'
import AssetsStatsCard from '@/components/assets/AssetsStatsCard'
import AssetsSidebarCard from '@/components/assets/AssetsSidebarCard'
import AssetsListCard from '@/components/assets/AssetsListCard'
import CreateAssetModal from '@/components/assets/CreateAssetModal'
import EditAssetModal from '@/components/assets/EditAssetModal'
import ManageAssetCategoriesModal from '@/components/assets/ManageAssetCategoriesModal'
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal'
import { QueryKeys } from '@/helpers/QueryKeys'
import { assetStatuses } from '@/helpers/assetOptions'

export default function AssetsComponent() {
  const [selectedCategory, setSelectedCategory] = useState<number | 'All'>('All')
  const [selectedStatus, setSelectedStatus] = useState<string | null>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [assetToDelete, setAssetToDelete] = useState<number | null>(null)
  const [assetToEdit, setAssetToEdit] = useState<number | null>(null)

  const queryClient = useQueryClient()

  const { data: assetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: [QueryKeys.Assets],
    queryFn: async () => await doQueryGet<GetAllAssetsDto>('/api/assets/GetAllAssets')
  })

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: [QueryKeys.AssetCategories],
    queryFn: async () => await doQueryGet<GetAllAssetCategoriesDto>('/api/assets/GetAllAssetCategories')
  })

  const assets = assetsData?.assets ?? []
  const categories = categoriesData?.categories ?? []

  // Delete asset mutation
  const { mutate: deleteAsset, isPending: isDeletingAsset } = useMutationDelete<number, void>({
    url: (assetId) => `/api/assets/DeleteAsset?assetId=${assetId}`,
    queryKey: [QueryKeys.Assets],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Asset deleted successfully', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete asset', 3000, <IconX />)
    }
  })

  // Create asset mutation
  const { mutate: createAsset, isPending: isCreatingAsset } = useMutationPost<CreateAssetRequest, number>({
    url: '/api/assets/CreateAsset',
    queryKey: [QueryKeys.Assets],
    invalidateQuery: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.AssetCategories] })
      closeCreateModal()
      notificationHelper.showSuccessNotification('Success', 'Asset created successfully', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to create asset', 3000, <IconX />)
    }
  })

  // Update asset mutation
  const { mutate: updateAsset, isPending: isUpdatingAsset } = useMutationPut<UpdateAssetRequest, void>({
    url: '/api/assets/UpdateAsset',
    queryKey: [QueryKeys.Assets],
    invalidateQuery: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.AssetCategories] })
      closeEditModal()
      notificationHelper.showSuccessNotification('Success', 'Asset updated successfully', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to update asset', 3000, <IconX />)
    }
  })

  const handleDownloadDocument = async (assetId: number, documentType: 'Receipt' | 'Manual') => {
    try {
      const response = await fetch(`/api/assets/DownloadAssetDocument?assetId=${assetId}&documentType=${documentType}`)

      if (!response.ok) {
        throw new Error(`Failed to download ${documentType.toLowerCase()}`)
      }

      const blob = await response.blob()

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${assets.find(a => a.assetId === assetId)?.assetName || 'asset'}_${documentType}`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      } else {
        // Infer extension from MIME type if no Content-Disposition
        const mimeType = blob.type
        let extension = ''
        if (mimeType === 'application/pdf') {
          extension = '.pdf'
        } else if (mimeType.startsWith('image/')) {
          extension = '.' + mimeType.split('/')[1]
        }
        filename += extension
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      notificationHelper.showSuccessNotification('Success', `${documentType} downloaded successfully`, 3000, <IconCheck />)
    } catch (error) {
      notificationHelper.showErrorNotification('Error', error instanceof Error ? error.message : `Failed to download ${documentType.toLowerCase()}`, 3000, <IconX />)
    }
  }

  const handleUploadDocument = async (assetId: number, file: File, documentType: 'Receipt' | 'Manual') => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('AssetId', assetId.toString())
      formData.append('DocumentType', documentType)

      const response = await doPostFormData('/api/assets/UploadAssetDocument', formData)

      if (!response.ok) {
        throw new Error(response.statusMessage ?? `Failed to upload ${documentType.toLowerCase()}`)
      }

      queryClient.invalidateQueries({ queryKey: [QueryKeys.Assets] })
      notificationHelper.showSuccessNotification('Success', `${documentType} uploaded successfully`, 3000, <IconCheck />)
    } catch (error) {
      notificationHelper.showErrorNotification('Error', error instanceof Error ? error.message : `Failed to upload ${documentType.toLowerCase()}`, 3000, <IconX />)
      throw error
    }
  }

  const handleDeleteDocument = async (assetId: number, documentType: 'Receipt' | 'Manual') => {
    try {
      const response = await fetch(`/api/assets/DeleteAssetDocument?assetId=${assetId}&documentType=${documentType}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${documentType.toLowerCase()}`)
      }

      queryClient.invalidateQueries({ queryKey: [QueryKeys.Assets] })
      notificationHelper.showSuccessNotification('Success', `${documentType} deleted successfully`, 3000, <IconCheck />)
    } catch (error) {
      notificationHelper.showErrorNotification('Error', error instanceof Error ? error.message : `Failed to delete ${documentType.toLowerCase()}`, 3000, <IconX />)
    }
  }

  const handleCategoryDeleted = () => {
    if (selectedCategory !== 'All') {
      setSelectedCategory('All')
    }
  }

  const handleDeleteClick = (assetId: number) => {
    setAssetToDelete(assetId)
    openDeleteModal()
  }

  const handleEditClick = (assetId: number) => {
    setAssetToEdit(assetId)
    openEditModal()
  }

  const confirmDeleteAsset = () => {
    if (assetToDelete !== null) {
      deleteAsset(assetToDelete)
      setAssetToDelete(null)
      closeDeleteModal()
    }
  }

  const filteredAssets = assets.filter(asset => {
    const categoryMatch = selectedCategory === 'All' || asset.categoryId === selectedCategory
    const statusMatch = selectedStatus === 'All' || selectedStatus === null || asset.status === selectedStatus
    const searchMatch = searchQuery === '' ||
      asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && statusMatch && searchMatch
  })

  if (isLoadingAssets || isLoadingCategories) {
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
              Assets
            </Title>
            <Text c="dimmed" size="sm">
              Track your devices, receipts, warranties, and documentation
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={openCreateModal}
          >
            Add Asset
          </Button>
        </Group>

        {/* Stats Cards */}
        <AssetsStatsCard assets={assets} categories={categories} />

        {/* Search and Filters */}
        <Card withBorder p="md" radius="md" shadow="sm">
          <Stack gap="md">
            <TextInput
              placeholder="Search assets by name, brand, model, or location..."
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
                  All Categories
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.categoryId}
                    variant={selectedCategory === category.categoryId ? 'filled' : 'light'}
                    size="xs"
                    onClick={() => setSelectedCategory(category.categoryId)}
                  >
                    {category.categoryName} ({category.assetCount})
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
              <Group gap="sm">
                <Select
                  placeholder="Filter by status"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  data={[
                    { value: 'All', label: 'All Statuses' },
                    ...assetStatuses
                  ]}
                  clearable
                  size="xs"
                  w={150}
                />
                <Badge variant="light">{filteredAssets.length} assets</Badge>
              </Group>
            </Group>
          </Stack>
        </Card>

        {/* Assets List */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <AssetsListCard
              assets={filteredAssets}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onDownloadDocument={handleDownloadDocument}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              isDeletingAsset={isDeletingAsset}
            />
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <AssetsSidebarCard
              assets={assets}
              categories={categories}
            />
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Create Asset Modal */}
      <CreateAssetModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        categories={categories}
        onCreate={createAsset}
        isCreating={isCreatingAsset}
      />

      {/* Edit Asset Modal */}
      {assetToEdit !== null && (
        <EditAssetModal
          opened={editModalOpened}
          onClose={() => {
            closeEditModal()
            setAssetToEdit(null)
          }}
          asset={assets.find(a => a.assetId === assetToEdit)!}
          categories={categories}
          onUpdate={updateAsset}
          isUpdating={isUpdatingAsset}
        />
      )}

      {/* Manage Categories Modal */}
      <ManageAssetCategoriesModal
        opened={categoryModalOpened}
        onClose={closeCategoryModal}
        categories={categories}
        assets={assets}
        onCategoryDeleted={handleCategoryDeleted}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteAsset}
        title="Delete Asset?"
        message="Are you sure you want to delete this asset? This will also delete any attached receipts and manuals. This action cannot be undone."
      />
    </Container>
  )
}
