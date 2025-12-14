'use client'

import { Modal, Stack, TextInput, Select, Group, Button } from '@mantine/core'
import { useState, useEffect } from 'react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { CreateNotePageRequest } from '@/interfaces/api/notes/CreateNotePageRequest'
import type { NoteFolder } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse'

interface AddNotePageModalProps {
  opened: boolean
  onClose: () => void
  folders: NoteFolder[]
  initialFolderId?: number | null
  onPageCreated?: () => void
}

export default function AddNotePageModal({
  opened,
  onClose,
  folders,
  initialFolderId,
  onPageCreated
}: AddNotePageModalProps) {
  const [title, setTitle] = useState('')
  const [folderId, setFolderId] = useState<string>('')

  useEffect(() => {
    if (initialFolderId !== undefined) {
      setFolderId(initialFolderId ? initialFolderId.toString() : '')
    }
  }, [initialFolderId])

  const { mutateAsync: createPage, isPending } = useMutationPost<CreateNotePageRequest, void>({
    url: '/api/notes/CreateNotePage',
    queryKey: ['notePages'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Note page created', 3000, <IconCheck />)
      resetForm()
      onClose()
      onPageCreated?.()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to create page', 3000, <IconX />)
    }
  })

  const resetForm = () => {
    setTitle('')
    setFolderId('')
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    const request: CreateNotePageRequest = {
      title: title.trim(),
      folderId: folderId ? parseInt(folderId) : null
    }

    await createPage(request)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="New Page"
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Page Title"
          placeholder="e.g., Project Notes"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
          disabled={isPending}
        />

        <Select
          label="Folder"
          placeholder="Select a folder (optional)"
          data={[
            { value: '', label: 'No folder (Unfiled)' },
            ...folders.map(f => ({ value: f.id.toString(), label: `${f.folderIcon} ${f.folderName}` }))
          ]}
          value={folderId}
          onChange={(value) => setFolderId(value || '')}
          clearable
          disabled={isPending}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isPending} loading={isPending}>
            Create Page
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
