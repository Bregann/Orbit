'use client'

import {
  Card,
  Stack,
  Title,
  Text,
  Group,
  Button,
  ActionIcon,
  Tooltip,
  Divider,
  Box,
  Breadcrumbs,
  Anchor,
  ThemeIcon
} from '@mantine/core'
import { RichTextEditor, Link as TiptapLink } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect } from 'react'
import { IconEdit, IconStar, IconStarFilled, IconChevronRight, IconHome, IconNote, IconPlus } from '@tabler/icons-react'
import { useMutationPut } from '@/helpers/mutations/useMutationPut'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { GetNotePageDetailsResponse } from '@/interfaces/api/notes/GetNotePageDetailsResponse'
import type { UpdateNotePageContentRequest } from '@/interfaces/api/notes/UpdateNotePageContentRequest'
import type { NoteFolder } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse'

interface NotesEditorProps {
  selectedPageId: number | null
  folders: NoteFolder[]
  onCreatePage: () => void
}

export default function NotesEditor({ selectedPageId, folders, onCreatePage }: NotesEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const { data: pageDetails, isLoading } = useQuery({
    queryKey: ['notePageDetails', selectedPageId?.toString() ?? 'none'],
    queryFn: async () => {
      if (!selectedPageId) return null
      return await doQueryGet<GetNotePageDetailsResponse>(`/api/notes/GetNotePageDetails?notePageId=${selectedPageId}`)
    },
    enabled: !!selectedPageId
  })

  const page = pageDetails?.notePage

  const { mutate: toggleFavourite } = useMutationPut<number, void>({
    url: (pageId) => `/api/notes/ToggleNotePageFavouriteStatus?notePageId=${pageId}`,
    queryKey: ['notePages'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Favourite status updated', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to update favourite', 3000, <IconX />)
    }
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink,
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: page?.content || '',
    editable: isEditing,
    immediatelyRender: false,
    onUpdate: () => {
      setHasUnsavedChanges(true)
    },
  })

  useEffect(() => {
    if (editor && page) {
      editor.commands.setContent(page.content)
      editor.setEditable(isEditing)
      setHasUnsavedChanges(false)
    }
  }, [page, editor, isEditing])

  const { mutateAsync: updateContent, isPending } = useMutationPut<UpdateNotePageContentRequest, void>({
    url: '/api/notes/UpdateNotePageContent',
    queryKey: ['notePageDetails', selectedPageId?.toString() ?? 'none'],
    invalidateQuery: false,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Page updated', 3000, <IconCheck />)
      setHasUnsavedChanges(false)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to update page', 3000, <IconX />)
    }
  })

  const handleSave = async () => {
    if (!selectedPageId || !editor) return

    const request: UpdateNotePageContentRequest = {
      notePageId: selectedPageId,
      content: editor.getHTML()
    }

    await updateContent(request)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    if (editor) {
      editor.setEditable(true)
    }
  }

  const getFolderById = (folderId: number) => folders.find(f => f.id === folderId)

  if (!selectedPageId || isLoading) {
    return (
      <Card withBorder p="lg" radius="md" shadow="sm" mih={600}>
        <Stack align="center" justify="center" h={400}>
          <ThemeIcon size={80} radius="xl" variant="light" color="gray">
            <IconNote size="3rem" />
          </ThemeIcon>
          <Title order={3} c="dimmed">No page selected</Title>
          <Text c="dimmed" size="sm">Select a page from the sidebar or create a new one</Text>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={onCreatePage}
          >
            Create New Page
          </Button>
        </Stack>
      </Card>
    )
  }

  if (!page) {
    return (
      <Card withBorder p="lg" radius="md" shadow="sm" mih={600}>
        <Text c="dimmed" ta="center">Page not found</Text>
      </Card>
    )
  }

  return (
    <Card withBorder p="lg" radius="md" shadow="sm" mih={600}>
      <Stack gap="md" h="100%">
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<IconChevronRight size="0.9rem" />}>
          <Anchor
            size="sm"
            c="dimmed"
            onClick={() => {}}
            style={{ cursor: 'default' }}
          >
            <Group gap={4}>
              <IconHome size="0.9rem" />
              Notes
            </Group>
          </Anchor>
          {page.folderId && getFolderById(page.folderId) && (
            <Anchor size="sm" c="dimmed" style={{ cursor: 'default' }}>
              {getFolderById(page.folderId)?.folderIcon} {getFolderById(page.folderId)?.folderName}
            </Anchor>
          )}
          <Anchor size="sm" style={{ cursor: 'default' }}>
            {page.title}
          </Anchor>
        </Breadcrumbs>

        {/* Page Title */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>{page.title}</Title>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                Last edited {new Date(page.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
              {page.folderId && getFolderById(page.folderId) && (
                <Text size="xs" c="dimmed">
                  • {getFolderById(page.folderId)?.folderIcon} {getFolderById(page.folderId)?.folderName}
                </Text>
              )}
            </Group>
          </div>
          <Group gap="xs">
            <Tooltip label={page.isFavourite ? 'Remove from favourites' : 'Add to favourites'}>
              <ActionIcon
                variant="subtle"
                color={page.isFavourite ? 'yellow' : 'gray'}
                onClick={() => toggleFavourite(page.id)}
              >
                {page.isFavourite ? <IconStarFilled size="1.2rem" /> : <IconStar size="1.2rem" />}
              </ActionIcon>
            </Tooltip>
            {!isEditing ? (
              <Button
                variant="light"
                size="sm"
                leftSection={<IconEdit size="1rem" />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            ) : (
              <Button
                variant="filled"
                size="sm"
                leftSection={<IconCheck size="1rem" />}
                onClick={handleSave}
                loading={isPending}
                disabled={!hasUnsavedChanges || isPending}
              >
                Save
              </Button>
            )}
          </Group>
        </Group>

        <Divider />

        {/* Rich Text Editor */}
        <Box style={{ flex: 1 }}>
          <RichTextEditor editor={editor} styles={{
            root: {
              border: isEditing ? undefined : 'none',
              backgroundColor: 'transparent',
            },
            content: {
              backgroundColor: 'transparent',
              minHeight: 300,
            },
            toolbar: {
              display: isEditing ? 'flex' : 'none',
            },
          }}>
            {isEditing && (
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                  <RichTextEditor.ClearFormatting />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.Hr />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Undo />
                  <RichTextEditor.Redo />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>
            )}
            <RichTextEditor.Content />
          </RichTextEditor>
        </Box>
      </Stack>
    </Card>
  )
}
