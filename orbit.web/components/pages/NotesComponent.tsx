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
  ThemeIcon,
  Modal,
  Paper,
  Box,
  ScrollArea,
  Menu,
  Breadcrumbs,
  Anchor,
  Divider,
  Tooltip,
  Select
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import { RichTextEditor } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TiptapLink from '@tiptap/extension-link'
import {
  IconPlus,
  IconTrash,
  IconNote,
  IconFolder,
  IconFile,
  IconChevronRight,
  IconDots,
  IconEdit,
  IconCopy,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconHome,
  IconFolderPlus
} from '@tabler/icons-react'

interface NoteFolder {
  id: number
  name: string
  icon: string
  color: string
}

interface NotePage {
  id: number
  title: string
  content: string
  icon: string
  folderId: number | null
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

// Mock folders
const mockFolders: NoteFolder[] = [
  { id: 1, name: 'Work', icon: '💼', color: 'blue' },
  { id: 2, name: 'Personal', icon: '🏠', color: 'green' },
  { id: 3, name: 'Projects', icon: '🚀', color: 'violet' },
]

// Mock pages
const mockPages: NotePage[] = [
  {
    id: 1,
    title: 'Welcome to Notes',
    content: '<p>This is your personal notes space. Create pages and organize them into folders.</p><h2>Getting Started</h2><p>Click the <strong>+ New Page</strong> button to create your first note!</p>',
    icon: '👋',
    folderId: null,
    isFavorite: true,
    createdAt: '2025-11-01',
    updatedAt: '2025-11-28'
  },
  {
    id: 2,
    title: 'Project Ideas',
    content: '<h2>App Ideas</h2><ul><li>Personal finance tracker</li><li>Habit tracker</li><li>Recipe manager</li></ul><h2>Side Projects</h2><p>Things to explore when I have time...</p>',
    icon: '💡',
    folderId: 3,
    isFavorite: false,
    createdAt: '2025-11-05',
    updatedAt: '2025-11-25'
  },
  {
    id: 3,
    title: 'Meeting Notes',
    content: '<h2>Weekly Standup - Nov 28</h2><p>Discussed project timeline and upcoming features.</p><h3>Action Items</h3><ul><li>Review PR #234</li><li>Update documentation</li></ul>',
    icon: '📝',
    folderId: 1,
    isFavorite: true,
    createdAt: '2025-11-10',
    updatedAt: '2025-11-28'
  },
  {
    id: 4,
    title: 'Finance App Features',
    content: '<h2>Core Features</h2><ul><li>Budget tracking</li><li>Expense categories</li><li>Monthly reports</li><li>Bill reminders</li></ul><h2>Nice to Have</h2><ul><li>Bank sync</li><li>Investment tracking</li></ul>',
    icon: '💰',
    folderId: 3,
    isFavorite: false,
    createdAt: '2025-11-15',
    updatedAt: '2025-11-20'
  },
  {
    id: 5,
    title: 'Reading List',
    content: '<h2>Books to Read</h2><ul><li><strong>Atomic Habits</strong> - James Clear</li><li><strong>Deep Work</strong> - Cal Newport</li><li><strong>The Pragmatic Programmer</strong></li></ul><h2>Articles</h2><p>Save interesting articles here...</p>',
    icon: '📚',
    folderId: 2,
    isFavorite: false,
    createdAt: '2025-11-20',
    updatedAt: '2025-11-22'
  },
  {
    id: 6,
    title: 'Personal Goals 2025',
    content: '<h2>Health</h2><ul><li>Exercise 3x per week</li><li>Drink more water</li><li>Better sleep schedule</li></ul><h2>Career</h2><ul><li>Learn TypeScript deeply</li><li>Contribute to open source</li></ul><h2>Personal</h2><ul><li>Read 12 books</li><li>Travel to 2 new countries</li></ul>',
    icon: '🎯',
    folderId: 2,
    isFavorite: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-11-30'
  },
]

const emojiOptions = ['📝', '💡', '📚', '🎯', '💰', '🏠', '💼', '🎨', '🎵', '🌟', '📅', '✅', '❤️', '🔥', '⭐', '📌', '🗂️', '📊', '🖼️', '🎮']

const folderColors = ['blue', 'green', 'violet', 'orange', 'pink', 'cyan', 'yellow', 'red']

export default function NotesComponent() {
  const [folders, setFolders] = useState<NoteFolder[]>(mockFolders)
  const [pages, setPages] = useState<NotePage[]>(mockPages)
  const [selectedPageId, setSelectedPageId] = useState<number | null>(1)
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<number[]>([1, 2, 3])

  const [addPageModalOpened, { open: openAddPageModal, close: closeAddPageModal }] = useDisclosure(false)
  const [addFolderModalOpened, { open: openAddFolderModal, close: closeAddFolderModal }] = useDisclosure(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageIcon, setNewPageIcon] = useState('📝')
  const [newPageFolderId, setNewPageFolderId] = useState<number | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderIcon, setNewFolderIcon] = useState('📁')
  const [newFolderColor, setNewFolderColor] = useState('blue')

  const selectedPage = pages.find(p => p.id === selectedPageId)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapLink,
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: selectedPage?.content || '',
    editable: isEditing,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (selectedPageId && isEditing) {
        setPages(pages.map(p =>
          p.id === selectedPageId
            ? { ...p, content: editor.getHTML(), updatedAt: new Date().toISOString().split('T')[0] }
            : p
        ))
      }
    },
  }, [selectedPageId, isEditing])

  const handleSelectPage = (pageId: number) => {
    if (isEditing && editor) {
      setPages(pages.map(p =>
        p.id === selectedPageId
          ? { ...p, content: editor.getHTML(), updatedAt: new Date().toISOString().split('T')[0] }
          : p
      ))
    }
    setSelectedPageId(pageId)
    setSelectedFolderId(null)
    setIsEditing(false)
    const page = pages.find(p => p.id === pageId)
    if (editor && page) {
      editor.commands.setContent(page.content)
    }
  }

  const getUnfiledPages = () => pages.filter(p => p.folderId === null)

  const getPagesInFolder = (folderId: number) => pages.filter(p => p.folderId === folderId)

  const getFavoritePages = () => pages.filter(p => p.isFavorite)

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  const handleAddPage = () => {
    if (!newPageTitle.trim()) return

    const newPage: NotePage = {
      id: Math.max(...pages.map(p => p.id), 0) + 1,
      title: newPageTitle.trim(),
      content: '<p></p>',
      icon: newPageIcon,
      folderId: newPageFolderId,
      isFavorite: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }

    setPages([...pages, newPage])
    if (newPageFolderId) {
      setExpandedFolders(prev => prev.includes(newPageFolderId) ? prev : [...prev, newPageFolderId])
    }
    setSelectedPageId(newPage.id)
    setSelectedFolderId(null)
    setIsEditing(true)
    if (editor) {
      editor.commands.setContent('<p></p>')
    }
    resetAddPageForm()
    closeAddPageModal()
  }

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return

    const newFolder: NoteFolder = {
      id: Math.max(...folders.map(f => f.id), 0) + 1,
      name: newFolderName.trim(),
      icon: newFolderIcon,
      color: newFolderColor,
    }

    setFolders([...folders, newFolder])
    setExpandedFolders(prev => [...prev, newFolder.id])
    resetAddFolderForm()
    closeAddFolderModal()
  }

  const resetAddPageForm = () => {
    setNewPageTitle('')
    setNewPageIcon('📝')
    setNewPageFolderId(null)
  }

  const resetAddFolderForm = () => {
    setNewFolderName('')
    setNewFolderIcon('📁')
    setNewFolderColor('blue')
  }

  const deletePage = (pageId: number) => {
    setPages(pages.filter(p => p.id !== pageId))
    if (selectedPageId === pageId) {
      const remaining = pages.filter(p => p.id !== pageId)
      setSelectedPageId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const deleteFolder = (folderId: number) => {
    // Move all pages in folder to unfiled
    setPages(pages.map(p => p.folderId === folderId ? { ...p, folderId: null } : p))
    setFolders(folders.filter(f => f.id !== folderId))
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null)
    }
  }

  const toggleFavorite = (pageId: number) => {
    setPages(pages.map(p =>
      p.id === pageId ? { ...p, isFavorite: !p.isFavorite } : p
    ))
  }

  const duplicatePage = (pageId: number) => {
    const page = pages.find(p => p.id === pageId)
    if (!page) return

    const newPage: NotePage = {
      ...page,
      id: Math.max(...pages.map(p => p.id), 0) + 1,
      title: `${page.title} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }

    setPages([...pages, newPage])
    setSelectedPageId(newPage.id)
  }

  const moveToFolder = (pageId: number, folderId: number | null) => {
    setPages(pages.map(p =>
      p.id === pageId ? { ...p, folderId } : p
    ))
  }

  const openAddPageInFolder = (folderId: number) => {
    setNewPageFolderId(folderId)
    openAddPageModal()
  }

  const filteredPages = searchQuery
    ? pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : null

  const getFolderById = (folderId: number) => folders.find(f => f.id === folderId)

  const renderPageItem = (page: NotePage) => {
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
        onClick={() => handleSelectPage(page.id)}
        wrap="nowrap"
      >
        <Text size="lg">{page.icon}</Text>
        <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{page.title}</Text>
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
            <Menu.Label>Move to folder</Menu.Label>
            <Menu.Item
              leftSection={<IconFile size="0.9rem" />}
              onClick={() => moveToFolder(page.id, null)}
              disabled={page.folderId === null}
            >
              Unfiled
            </Menu.Item>
            {folders.map(f => (
              <Menu.Item
                key={f.id}
                leftSection={<Text size="sm">{f.icon}</Text>}
                onClick={() => moveToFolder(page.id, f.id)}
                disabled={page.folderId === f.id}
              >
                {f.name}
              </Menu.Item>
            ))}
            <Menu.Divider />
            <Menu.Item
              leftSection={page.isFavorite ? <IconStarFilled size="0.9rem" /> : <IconStar size="0.9rem" />}
              onClick={() => toggleFavorite(page.id)}
            >
              {page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconCopy size="0.9rem" />}
              onClick={() => duplicatePage(page.id)}
            >
              Duplicate
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
          <Text size="lg">{folder.icon}</Text>
          <Text size="sm" fw={500} style={{ flex: 1 }}>{folder.name}</Text>
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
                onClick={() => openAddPageInFolder(folder.id)}
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
              onClick={() => {
                setNewPageFolderId(null)
                openAddPageModal()
              }}
            >
              New Page
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Total Pages</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                  <IconNote size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{pages.length}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Favorites</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="yellow">
                  <IconStar size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{getFavoritePages().length}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Folders</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                  <IconFolder size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{folders.length}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Unfiled</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                  <IconFile size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{getUnfiledPages().length}</Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Main Content */}
        <Grid gutter="md">
          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 3 }}>
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
                              handleSelectPage(page.id)
                              setSearchQuery('')
                            }}
                          >
                            <Group gap="xs">
                              <Text size="lg">{page.icon}</Text>
                              <Text size="sm" lineClamp={1}>{page.title}</Text>
                            </Group>
                          </Paper>
                        ))
                      )}
                    </Stack>
                  ) : (
                    <Stack gap="md">
                      {/* Favorites */}
                      {getFavoritePages().length > 0 && (
                        <Box>
                          <Text size="xs" c="dimmed" fw={500} tt="uppercase" mb="xs">Favorites</Text>
                          {getFavoritePages().map(page => (
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
                              onClick={() => handleSelectPage(page.id)}
                            >
                              <Text size="lg">{page.icon}</Text>
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
            </Card>
          </Grid.Col>

          {/* Editor Area */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Card withBorder p="lg" radius="md" shadow="sm" mih={600}>
              {selectedPage ? (
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
                    {selectedPage.folderId && getFolderById(selectedPage.folderId) && (
                      <Anchor size="sm" c="dimmed" style={{ cursor: 'default' }}>
                        {getFolderById(selectedPage.folderId)?.icon} {getFolderById(selectedPage.folderId)?.name}
                      </Anchor>
                    )}
                    <Anchor size="sm" style={{ cursor: 'default' }}>
                      {selectedPage.icon} {selectedPage.title}
                    </Anchor>
                  </Breadcrumbs>

                  {/* Page Title */}
                  <Group justify="space-between" align="flex-start">
                    <Group gap="md">
                      <Text size="2.5rem">{selectedPage.icon}</Text>
                      <div>
                        <Title order={2}>{selectedPage.title}</Title>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Last edited {new Date(selectedPage.updatedAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </Text>
                          {selectedPage.folderId && getFolderById(selectedPage.folderId) && (
                            <Text size="xs" c="dimmed">
                              • {getFolderById(selectedPage.folderId)?.icon} {getFolderById(selectedPage.folderId)?.name}
                            </Text>
                          )}
                        </Group>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Tooltip label={selectedPage.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                        <ActionIcon
                          variant="subtle"
                          color={selectedPage.isFavorite ? 'yellow' : 'gray'}
                          onClick={() => toggleFavorite(selectedPage.id)}
                        >
                          {selectedPage.isFavorite ? <IconStarFilled size="1.2rem" /> : <IconStar size="1.2rem" />}
                        </ActionIcon>
                      </Tooltip>
                      <Button
                        variant={isEditing ? 'filled' : 'light'}
                        size="sm"
                        leftSection={<IconEdit size="1rem" />}
                        onClick={() => {
                          if (isEditing && editor) {
                            setPages(pages.map(p =>
                              p.id === selectedPageId
                                ? { ...p, content: editor.getHTML(), updatedAt: new Date().toISOString().split('T')[0] }
                                : p
                            ))
                          }
                          setIsEditing(!isEditing)
                          if (editor) {
                            editor.setEditable(!isEditing)
                          }
                        }}
                      >
                        {isEditing ? 'Done' : 'Edit'}
                      </Button>
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
              ) : (
                <Stack align="center" justify="center" h={400}>
                  <ThemeIcon size={80} radius="xl" variant="light" color="gray">
                    <IconNote size="3rem" />
                  </ThemeIcon>
                  <Title order={3} c="dimmed">No page selected</Title>
                  <Text c="dimmed" size="sm">Select a page from the sidebar or create a new one</Text>
                  <Button
                    leftSection={<IconPlus size="1rem" />}
                    onClick={() => {
                      setNewPageFolderId(null)
                      openAddPageModal()
                    }}
                  >
                    Create New Page
                  </Button>
                </Stack>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Add Page Modal */}
      <Modal
        opened={addPageModalOpened}
        onClose={() => {
          resetAddPageForm()
          closeAddPageModal()
        }}
        title="New Page"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Page Title"
            placeholder="e.g., Project Notes"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.currentTarget.value)}
            required
          />

          <Select
            label="Folder"
            placeholder="Select a folder (optional)"
            data={[
              { value: '', label: 'No folder (Unfiled)' },
              ...folders.map(f => ({ value: f.id.toString(), label: `${f.icon} ${f.name}` }))
            ]}
            value={newPageFolderId?.toString() || ''}
            onChange={(value) => setNewPageFolderId(value ? parseInt(value) : null)}
            clearable
          />

          <Box>
            <Text size="sm" fw={500} mb="xs">Icon</Text>
            <Group gap="xs">
              {emojiOptions.map(emoji => (
                <ActionIcon
                  key={emoji}
                  size="lg"
                  variant={newPageIcon === emoji ? 'filled' : 'subtle'}
                  onClick={() => setNewPageIcon(emoji)}
                >
                  <Text size="lg">{emoji}</Text>
                </ActionIcon>
              ))}
            </Group>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => { resetAddPageForm(); closeAddPageModal() }}>Cancel</Button>
            <Button onClick={handleAddPage}>Create Page</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add Folder Modal */}
      <Modal
        opened={addFolderModalOpened}
        onClose={() => {
          resetAddFolderForm()
          closeAddFolderModal()
        }}
        title="New Folder"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Folder Name"
            placeholder="e.g., Work Projects"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.currentTarget.value)}
            required
          />

          <Box>
            <Text size="sm" fw={500} mb="xs">Icon</Text>
            <Group gap="xs">
              {emojiOptions.map(emoji => (
                <ActionIcon
                  key={emoji}
                  size="lg"
                  variant={newFolderIcon === emoji ? 'filled' : 'subtle'}
                  onClick={() => setNewFolderIcon(emoji)}
                >
                  <Text size="lg">{emoji}</Text>
                </ActionIcon>
              ))}
            </Group>
          </Box>

          <Box>
            <Text size="sm" fw={500} mb="xs">Color</Text>
            <Group gap="xs">
              {folderColors.map(color => (
                <ActionIcon
                  key={color}
                  size="lg"
                  variant={newFolderColor === color ? 'filled' : 'light'}
                  color={color}
                  onClick={() => setNewFolderColor(color)}
                />
              ))}
            </Group>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => { resetAddFolderForm(); closeAddFolderModal() }}>Cancel</Button>
            <Button onClick={handleAddFolder}>Create Folder</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
