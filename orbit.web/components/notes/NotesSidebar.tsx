'use client'

import {
  Card,
  Stack,
  TextInput,
  ScrollArea,
  Text,
  Box,
  Group,
  ActionIcon,
  Menu,
  Divider,
  Paper
} from '@mantine/core'
import {
  IconSearch,
  IconChevronRight,
  IconStarFilled,
  IconDots,
  IconPlus,
  IconTrash,
  IconStar
} from '@tabler/icons-react'
import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { useMutationPut } from '@/helpers/mutations/useMutationPut'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { NotePage, NoteFolder } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse'
import AddNotePageModal from './AddNotePageModal'
import { QueryKeys } from '@/helpers/QueryKeys'

interface NotesSidebarProps {
  pages: NotePage[]
  folders: NoteFolder[]
  selectedPageId: number | null
  onSelectPage: (_pageId: number) => void
}

export default function NotesSidebar({
  pages,
  folders,
  selectedPageId,
  onSelectPage
}: NotesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<number[]>(folders.map(f => f.id))
  const [initialFolderId, setInitialFolderId] = useState<number | null>(null)
  const [addPageModalOpened, { open: openAddPageModal, close: closeAddPageModal }] = useDisclosure(false)

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

  const { mutate: deletePage } = useMutationDelete<number, void>({
    url: (pageId) => `/api/notes/DeleteNotePage?notePageId=${pageId}`,
    queryKey: [QueryKeys.NotePages],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Page deleted', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete page', 3000, <IconX />)
    }
  })

  const { mutate: deleteFolder } = useMutationDelete<number, void>({
    url: (folderId) => `/api/notes/DeleteNoteFolder?noteFolderId=${folderId}`,
    queryKey: [QueryKeys.NotePages],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Folder deleted', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete folder', 3000, <IconX />)
    }
  })

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  const getFavouritePages = () => pages.filter(p => p.isFavourite)
  const getUnfiledPages = () => pages.filter(p => p.folderId === null)
  const getPagesInFolder = (folderId: number) => pages.filter(p => p.folderId === folderId)

  const filteredPages = searchQuery
    ? pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : null

  const renderPageItem = (page: NotePage, showMenu = true) => {
    const isSelected = selectedPageId === page.id

    return (
      <Group
        key={page.id}
        gap="xs"
        py={6}
        px="xs"
        style={{
          cursor: 'pointer',
          borderRadius: 4,
          backgroundColor: isSelected ? 'var(--mantine-color-dark-5)' : 'transparent',
        }}
        onClick={() => onSelectPage(page.id)}
        wrap="nowrap"
      >
        <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{page.title}</Text>
        {showMenu && (
          <Menu position="right-start" withinPortal>
            <Menu.Target>
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={(e) => e.stopPropagation()}
                style={{ opacity: 0.5 }}
              >
                <IconDots size="0.9rem" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={page.isFavourite ? <IconStarFilled size="0.9rem" /> : <IconStar size="0.9rem" />}
                onClick={() => toggleFavourite(page.id)}
              >
                {page.isFavourite ? 'Remove from Favourites' : 'Add to Favourites'}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size="0.9rem" />}
                onClick={() => deletePage(page.id)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    )
  }

  const renderFolderItem = (folder: NoteFolder) => {
    const isExpanded = expandedFolders.includes(folder.id)
    const folderPages = getPagesInFolder(folder.id)

    return (
      <Box key={folder.id}>
        <Group
          gap={4}
          py={6}
          px="xs"
          style={{
            cursor: 'pointer',
            borderRadius: 4,
          }}
          onClick={() => toggleFolder(folder.id)}
          wrap="nowrap"
        >
          <ActionIcon
            size="xs"
            variant="subtle"
            style={{
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          >
            <IconChevronRight size="0.8rem" />
          </ActionIcon>
          <Text size="lg">{folder.folderIcon}</Text>
          <Text size="sm" fw={500} style={{ flex: 1 }}>{folder.folderName}</Text>
          <Text size="xs" c="dimmed">{folderPages.length}</Text>
          <Menu position="right-start" withinPortal>
            <Menu.Target>
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={(e) => e.stopPropagation()}
                style={{ opacity: 0.5 }}
              >
                <IconDots size="0.9rem" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconPlus size="0.9rem" />}
                onClick={() => {
                  setInitialFolderId(folder.id)
                  openAddPageModal()
                }}
              >
                Add page here
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size="0.9rem" />}
                onClick={() => deleteFolder(folder.id)}
              >
                Delete folder
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        {isExpanded && folderPages.length > 0 && (
          <Box pl="md">
            {folderPages.map(page => renderPageItem(page))}
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Card withBorder p="md" radius="md" shadow="sm" h="100%">
      <Stack gap="md">
        {/* Search */}
        <TextInput
          placeholder="Search pages..."
          leftSection={<IconSearch size="1rem" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          size="sm"
        />

        {/* Search Results or Page Tree */}
        <ScrollArea h={500} offsetScrollbars>
          {filteredPages ? (
            <Stack gap="xs">
              <Text size="xs" c="dimmed" fw={500} tt="uppercase">Search Results</Text>
              {filteredPages.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">No pages found</Text>
              ) : (
                filteredPages.map(page => (
                  <Paper
                    key={page.id}
                    p="xs"
                    withBorder
                    radius="sm"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onSelectPage(page.id)
                      setSearchQuery('')
                    }}
                  >
                    <Text size="sm" lineClamp={1}>{page.title}</Text>
                  </Paper>
                ))
              )}
            </Stack>
          ) : (
            <Stack gap="md">
              {/* Favourites */}
              {getFavouritePages().length > 0 && (
                <Box>
                  <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb="xs">Favourites</Text>
                  {getFavouritePages().map(page => (
                    <Group
                      key={page.id}
                      gap="xs"
                      py={6}
                      px="xs"
                      style={{
                        cursor: 'pointer',
                        borderRadius: 4,
                        backgroundColor: selectedPageId === page.id ? 'var(--mantine-color-dark-5)' : 'transparent',
                      }}
                      onClick={() => onSelectPage(page.id)}
                    >
                      <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{page.title}</Text>
                      <IconStarFilled size="0.8rem" style={{ color: 'var(--mantine-color-yellow-5)' }} />
                    </Group>
                  ))}
                </Box>
              )}

              <Divider />

              {/* Folders */}
              <Box>
                <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb="xs">Folders</Text>
                {folders.map(folder => renderFolderItem(folder))}
              </Box>

              <Divider />

              {/* Unfiled Pages */}
              <Box>
                <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb="xs">Unfiled</Text>
                {getUnfiledPages().length === 0 ? (
                  <Text size="xs" c="dimmed" py="xs">No unfiled pages</Text>
                ) : (
                  getUnfiledPages().map(page => renderPageItem(page))
                )}
              </Box>
            </Stack>
          )}
        </ScrollArea>
      </Stack>

      <AddNotePageModal
        opened={addPageModalOpened}
        onClose={closeAddPageModal}
        folders={folders}
        initialFolderId={initialFolderId}
        onPageCreated={() => {}}
      />
    </Card>
  )
}
