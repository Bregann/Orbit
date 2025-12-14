'use client'

import { Modal, Stack, TextInput, Group, Button } from '@mantine/core'
import { useState } from 'react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { CreateNoteFolderRequest } from '@/interfaces/api/notes/CreateNoteFolderRequest'
import EmojiPicker from './EmojiPicker'

interface AddNoteFolderModalProps {
  opened: boolean
  onClose: () => void
}

export default function AddNoteFolderModal({ opened, onClose }: AddNoteFolderModalProps) {
  const [folderName, setFolderName] = useState('')
  const [folderIcon, setFolderIcon] = useState('📁')

  const { mutateAsync: createFolder, isPending } = useMutationPost<CreateNoteFolderRequest, void>({
    url: '/api/notes/CreateNoteFolder',
    queryKey: ['notePages'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Folder created', 3000, <IconCheck />)
      resetForm()
      onClose()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to create folder', 3000, <IconX />)
    }
  })

  const resetForm = () => {
    setFolderName('')
    setFolderIcon('📁')
  }

  const handleSubmit = async () => {
    if (!folderName.trim()) return

    const request: CreateNoteFolderRequest = {
      folderName: folderName.trim(),
      folderIcon: folderIcon
    }

    await createFolder(request)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="New Folder"
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Folder Name"
          placeholder="e.g., Work Projects"
          value={folderName}
          onChange={(e) => setFolderName(e.currentTarget.value)}
          required
          disabled={isPending}
        />

        <EmojiPicker
          label="Icon"
          value={folderIcon}
          onChange={setFolderIcon}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!folderName.trim() || isPending} loading={isPending}>
            Create Folder
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
