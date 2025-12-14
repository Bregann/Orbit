'use client'

import {
  Container,
  Grid,
  Title,
  Button,
  Group,
  Stack,
  Text
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import { IconPlus, IconFolderPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetNotePagesAndFoldersResponse } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse'
import NotesStatsCards from '@/components/notes/NotesStatsCards'
import NotesSidebar from '@/components/notes/NotesSidebar'
import NotesEditor from '@/components/notes/NotesEditor'
import AddNotePageModal from '@/components/notes/AddNotePageModal'
import AddNoteFolderModal from '@/components/notes/AddNoteFolderModal'

export default function NotesComponent() {
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null)

  const [addPageModalOpened, { open: openAddPageModal, close: closeAddPageModal }] = useDisclosure(false)
  const [addFolderModalOpened, { open: openAddFolderModal, close: closeAddFolderModal }] = useDisclosure(false)

  const { data: notesData } = useQuery({
    queryKey: ['notePages'],
    queryFn: async () => await doQueryGet<GetNotePagesAndFoldersResponse>('/api/notes/GetNotePagesAndFolders')
  })

  const pages = notesData?.notePages ?? []
  const folders = notesData?.noteFolders ?? []

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Notes
            </Title>
            <Text c="dimmed" size="sm">
              Your personal workspace for ideas, notes, and documentation
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconFolderPlus size="1rem" />}
              onClick={openAddFolderModal}
            >
              New Folder
            </Button>
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={openAddPageModal}
            >
              New Page
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <NotesStatsCards pages={pages} folders={folders} />

        {/* Main Content */}
        <Grid gutter="md">
          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <NotesSidebar
              pages={pages}
              folders={folders}
              selectedPageId={selectedPageId}
              onSelectPage={setSelectedPageId}
            />
          </Grid.Col>

          {/* Editor Area */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <NotesEditor
              selectedPageId={selectedPageId}
              folders={folders}
              onCreatePage={openAddPageModal}
            />
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Add Page Modal */}
      <AddNotePageModal
        opened={addPageModalOpened}
        onClose={closeAddPageModal}
        folders={folders}
        initialFolderId={null}
        onPageCreated={() => {}}
      />

      {/* Add Folder Modal */}
      <AddNoteFolderModal
        opened={addFolderModalOpened}
        onClose={closeAddFolderModal}
      />
    </Container>
  )
}
