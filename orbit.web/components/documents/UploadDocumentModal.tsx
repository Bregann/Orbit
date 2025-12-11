'use client'

import { Modal, Stack, Group, TextInput, Button, FileInput, Select } from '@mantine/core'
import { useState } from 'react'
import { IconUpload, IconCheck, IconX } from '@tabler/icons-react'
import notificationHelper from '@/helpers/notificationHelper'
import type { DocumentCategoryItem } from '@/interfaces/api/documents/GetAllDocumentCategoriesDto'

interface UploadDocumentModalProps {
  opened: boolean
  onClose: () => void
  categories: DocumentCategoryItem[]
  onUpload: (_file: File, _documentName: string, _categoryId: number) => Promise<void>
  isUploading: boolean
}

export default function UploadDocumentModal({
  opened,
  onClose,
  categories,
  onUpload,
  isUploading
}: UploadDocumentModalProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadName, setUploadName] = useState('')
  const [uploadCategory, setUploadCategory] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!uploadFile) {
      notificationHelper.showErrorNotification('Error', 'Please select a file to upload', 3000, <IconX />)
      return
    }

    if (!uploadCategory) {
      notificationHelper.showErrorNotification('Error', 'Please select a category', 3000, <IconX />)
      return
    }

    const documentName = uploadName.trim() || uploadFile.name
    const categoryId = parseInt(uploadCategory, 10)

    try {
      await onUpload(uploadFile, documentName, categoryId)
      setUploadFile(null)
      setUploadName('')
      setUploadCategory(null)
      onClose()
      notificationHelper.showSuccessNotification('Success', 'Document uploaded successfully', 3000, <IconCheck />)
    } catch (error) {
      notificationHelper.showErrorNotification('Error', error instanceof Error ? error.message : 'Failed to upload document', 3000, <IconX />)
    }
  }

  const handleClose = () => {
    setUploadFile(null)
    setUploadName('')
    setUploadCategory(null)
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
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
          required
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
          data={categories.map(c => ({ value: c.id.toString(), label: c.categoryName }))}
          value={uploadCategory}
          onChange={setUploadCategory}
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            leftSection={<IconUpload size="1rem" />} 
            loading={isUploading}
            disabled={!uploadFile || !uploadCategory || isUploading}
          >
            Upload
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
