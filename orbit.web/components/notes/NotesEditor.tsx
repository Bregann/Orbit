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
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { useState, useEffect } from 'react'
import { IconEdit, IconStar, IconStarFilled, IconChevronRight, IconHome, IconNote, IconPlus } from '@tabler/icons-react'
import { useMutationPut } from '@/helpers/mutations/useMutationPut'
import { useQuery } from '@tanstack/react-query'
import styles from '@/css/notesEditor.module.css'
import { doQueryGet } from '@/helpers/apiClient'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { GetNotePageDetailsResponse } from '@/interfaces/api/notes/GetNotePageDetailsResponse'
import type { UpdateNotePageContentRequest } from '@/interfaces/api/notes/UpdateNotePageContentRequest'
import type { NoteFolder } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse'
import { QueryKeys } from '@/helpers/QueryKeys'

interface NotesEditorProps {
  selectedPageId: number | null
  folders: NoteFolder[]
  onCreatePage: () => void
}

export default function NotesEditor({ selectedPageId, folders, onCreatePage }: NotesEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const { data: pageDetails, isLoading } = useQuery({
    queryKey: [QueryKeys.NotePageDetails, selectedPageId?.toString() ?? 'none'],
    queryFn: async () => {
      if (!selectedPageId) return null
      return await doQueryGet<GetNotePageDetailsResponse>(`/api/notes/GetNotePageDetails?notePageId=${selectedPageId}`)
    },
    enabled: !!selectedPageId
  })

  const page = pageDetails?.notePage

  const { mutate: toggleFavourite } = useMutationPut<number, void>({
    url: (pageId) => `/api/notes/ToggleNotePageFavouriteStatus?notePageId=${pageId}`,
    queryKey: [QueryKeys.NotePages],
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
      Table.configure({
        resizable: true,
      }),
      TableRow.configure(),
      TableHeader.configure(),
      TableCell.configure(),
    ],
    content: page?.content || '',
    editable: isEditing,
    immediatelyRender: false,
    onUpdate: () => {
      setHasUnsavedChanges(true)
    },
  }, [page?.content, isEditing])

  useEffect(() => {
    if (editor && page) {
      editor.commands.setContent(page.content)
      editor.setEditable(isEditing)
      setHasUnsavedChanges(false)
    }
  }, [page, editor, isEditing])

  const { mutateAsync: updateContent, isPending } = useMutationPut<UpdateNotePageContentRequest, void>({
    url: '/api/notes/UpdateNotePageContent',
    queryKey: [QueryKeys.NotePageDetails, selectedPageId?.toString() ?? 'none'],
    invalidateQuery: true,
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
        <Box style={{ flex: 1 }} className={styles.editorContent}>
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
                  <RichTextEditor.Control
                    onClick={() => {
                      if (editor) {
                        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                      }
                    }}
                    aria-label="Insert table"
                    title="Insert table"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="3" y1="15" x2="21" y2="15"></line>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                      <line x1="15" y1="3" x2="15" y2="21"></line>
                    </svg>
                  </RichTextEditor.Control>
                  <RichTextEditor.Control
                    onClick={() => editor?.chain().focus().addColumnBefore().run()}
                    aria-label="Add column before"
                    title="Add column before"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="8" y="4" width="8" height="16" rx="1"></rect>
                      <line x1="12" y1="4" x2="12" y2="20"></line>
                      <path d="M4 12h4M6 10v4"></path>
                    </svg>
                  </RichTextEditor.Control>
                  <RichTextEditor.Control
                    onClick={() => editor?.chain().focus().addRowAfter().run()}
                    aria-label="Add row after"
                    title="Add row after"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="8" width="16" height="8" rx="1"></rect>
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                      <path d="M12 20v-4M10 18h4"></path>
                    </svg>
                  </RichTextEditor.Control>
                  <RichTextEditor.Control
                    onClick={() => editor?.chain().focus().deleteColumn().run()}
                    aria-label="Delete column"
                    title="Delete column"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="8" y="4" width="8" height="16" rx="1"></rect>
                      <line x1="12" y1="4" x2="12" y2="20"></line>
                      <line x1="3" y1="9" x2="6" y2="15"></line>
                      <line x1="6" y1="9" x2="3" y2="15"></line>
                    </svg>
                  </RichTextEditor.Control>
                  <RichTextEditor.Control
                    onClick={() => editor?.chain().focus().deleteRow().run()}
                    aria-label="Delete row"
                    title="Delete row"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="8" width="16" height="8" rx="1"></rect>
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                      <line x1="9" y1="3" x2="15" y2="6"></line>
                      <line x1="15" y1="3" x2="9" y2="6"></line>
                    </svg>
                  </RichTextEditor.Control>
                  <RichTextEditor.Control
                    onClick={() => editor?.chain().focus().deleteTable().run()}
                    aria-label="Delete table"
                    title="Delete table"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </RichTextEditor.Control>
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
