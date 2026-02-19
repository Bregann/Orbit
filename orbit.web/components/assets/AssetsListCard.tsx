'use client'

import { Card, Text, Group, ThemeIcon, Title, Divider, Table, ActionIcon, Tooltip, Badge, Menu } from '@mantine/core'
import { IconDeviceLaptop, IconEdit, IconTrash, IconReceipt, IconBook, IconDownload, IconUpload, IconX } from '@tabler/icons-react'
import type { AssetItem } from '@/interfaces/api/assets/GetAllAssetsDto'
import { useState } from 'react'
import { getAssetStatusColor } from '@/helpers/assetOptions'

interface AssetsListCardProps {
  assets: AssetItem[]
  onEdit: (_assetId: number) => void
  onDelete: (_assetId: number) => void
  onDownloadDocument: (_assetId: number, _documentType: 'Receipt' | 'Manual') => void
  onUploadDocument: (_assetId: number, _file: File, _documentType: 'Receipt' | 'Manual') => Promise<void>
  onDeleteDocument: (_assetId: number, _documentType: 'Receipt' | 'Manual') => void
  isDeletingAsset: boolean
}

export default function AssetsListCard({
  assets,
  onEdit,
  onDelete,
  onDownloadDocument,
  onUploadDocument,
  onDeleteDocument,
  isDeletingAsset
}: AssetsListCardProps) {
  const [uploadingAssetId, setUploadingAssetId] = useState<number | null>(null)
  const [uploadingType, setUploadingType] = useState<'Receipt' | 'Manual' | null>(null)

  const handleFileUpload = async (file: File | null, assetId: number, documentType: 'Receipt' | 'Manual') => {
    if (!file) return

    setUploadingAssetId(assetId)
    setUploadingType(documentType)

    try {
      await onUploadDocument(assetId, file, documentType)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploadingAssetId(null)
      setUploadingType(null)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>, assetId: number, documentType: 'Receipt' | 'Manual') => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file, assetId, documentType)
    }
    // Reset the input so the same file can be selected again
    event.target.value = ''
  }

  const isWarrantyExpiringSoon = (warrantyDate: string | null) => {
    if (!warrantyDate) return false
    const warranty = new Date(warrantyDate)
    const now = new Date()
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(now.getMonth() + 3)
    return warranty <= threeMonthsFromNow && warranty >= now
  }

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon size="lg" radius="md" variant="light" color="blue">
            <IconDeviceLaptop size="1.2rem" />
          </ThemeIcon>
          <Title order={3} size="h4">All Assets</Title>
        </Group>
      </Group>

      <Divider mb="md" />

      {assets.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No assets found. Add an asset to get started!
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Asset</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Purchase Date</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Documents</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {assets.map(asset => (
                <Table.Tr key={asset.assetId}>
                  <Table.Td>
                    <div>
                      <Text size="sm" fw={500}>{asset.assetName}</Text>
                      {(asset.brand || asset.model) && (
                        <Text size="xs" c="dimmed">
                          {[asset.brand, asset.model].filter(Boolean).join(' - ')}
                        </Text>
                      )}
                      {asset.location && (
                        <Text size="xs" c="dimmed">📍 {asset.location}</Text>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light">{asset.categoryName}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(asset.purchaseDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                    {asset.warrantyExpirationDate && (
                      <Text size="xs" c={isWarrantyExpiringSoon(asset.warrantyExpirationDate) ? 'orange' : 'dimmed'}>
                        Warranty: {new Date(asset.warrantyExpirationDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {asset.purchasePrice ? `£${asset.purchasePrice.toFixed(2)}` : '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={getAssetStatusColor(asset.status)}>{asset.status}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {/* Receipt Menu */}
                      <Menu position="bottom" shadow="md">
                        <Menu.Target>
                          <Tooltip label={asset.hasReceipt ? 'Manage Receipt' : 'Upload Receipt'}>
                            <ActionIcon
                              variant={asset.hasReceipt ? 'filled' : 'subtle'}
                              color="blue"
                              size="sm"
                              loading={uploadingAssetId === asset.assetId && uploadingType === 'Receipt'}
                            >
                              <IconReceipt size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {asset.hasReceipt ? (
                            <>
                              <Menu.Item
                                leftSection={<IconDownload size="1rem" />}
                                onClick={() => onDownloadDocument(asset.assetId, 'Receipt')}
                              >
                                Download
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconUpload size="1rem" />}
                                onClick={() => {
                                  const input = document.createElement('input')
                                  input.type = 'file'
                                  input.accept = 'image/*,application/pdf'
                                  input.onchange = (e) => handleFileInputChange(e as any, asset.assetId, 'Receipt')
                                  input.click()
                                }}
                              >
                                Replace
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconX size="1rem" />}
                                color="red"
                                onClick={() => onDeleteDocument(asset.assetId, 'Receipt')}
                              >
                                Delete
                              </Menu.Item>
                            </>
                          ) : (
                            <Menu.Item
                              leftSection={<IconUpload size="1rem" />}
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*,application/pdf'
                                input.onchange = (e) => handleFileInputChange(e as any, asset.assetId, 'Receipt')
                                input.click()
                              }}
                            >
                              Upload Receipt
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>

                      {/* Manual Menu */}
                      <Menu position="bottom" shadow="md">
                        <Menu.Target>
                          <Tooltip label={asset.hasManual ? 'Manage Manual' : 'Upload Manual'}>
                            <ActionIcon
                              variant={asset.hasManual ? 'filled' : 'subtle'}
                              color="violet"
                              size="sm"
                              loading={uploadingAssetId === asset.assetId && uploadingType === 'Manual'}
                            >
                              <IconBook size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {asset.hasManual ? (
                            <>
                              <Menu.Item
                                leftSection={<IconDownload size="1rem" />}
                                onClick={() => onDownloadDocument(asset.assetId, 'Manual')}
                              >
                                Download
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconUpload size="1rem" />}
                                onClick={() => {
                                  const input = document.createElement('input')
                                  input.type = 'file'
                                  input.accept = 'image/*,application/pdf'
                                  input.onchange = (e) => handleFileInputChange(e as any, asset.assetId, 'Manual')
                                  input.click()
                                }}
                              >
                                Replace
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconX size="1rem" />}
                                color="red"
                                onClick={() => onDeleteDocument(asset.assetId, 'Manual')}
                              >
                                Delete
                              </Menu.Item>
                            </>
                          ) : (
                            <Menu.Item
                              leftSection={<IconUpload size="1rem" />}
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*,application/pdf'
                                input.onchange = (e) => handleFileInputChange(e as any, asset.assetId, 'Manual')
                                input.click()
                              }}
                            >
                              Upload Manual
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Edit">
                        <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => onEdit(asset.assetId)}>
                          <IconEdit size="1rem" />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => onDelete(asset.assetId)}
                          disabled={isDeletingAsset}
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
