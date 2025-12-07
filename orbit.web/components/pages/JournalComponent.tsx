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
  Badge,
  TextInput,
  ActionIcon,
  Divider,
  ThemeIcon,
  Modal,
  Select,
  Paper
} from '@mantine/core'
import { RichTextEditor, Link } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconPlus,
  IconTrash,
  IconBook,
  IconCalendar,
  IconMoodSmile,
  IconMoodSad,
  IconMoodEmpty,
  IconMoodHappy,
  IconMoodCrazyHappy,
  IconEdit
} from '@tabler/icons-react'

// Mock data - replace with real data later
const mockEntries = [
  {
    id: 1,
    title: 'Great start to December',
    content: '<p>Had a really productive day today. Finished all my tasks and even had time for a walk in the park.</p>',
    mood: 'great',
    date: '2025-12-01'
  },
  {
    id: 2,
    title: 'Weekend reflections',
    content: '<p>Spent the weekend with family. It was nice to catch up with everyone. Need to do this more often.</p>',
    mood: 'good',
    date: '2025-11-30'
  },
  {
    id: 3,
    title: 'Busy week ahead',
    content: '<p>Feeling a bit overwhelmed with everything coming up. Made a list to stay organized.</p><ul><li>Finish project report</li><li>Call the bank</li><li>Grocery shopping</li></ul>',
    mood: 'neutral',
    date: '2025-11-28'
  },
  {
    id: 4,
    title: 'Tough day',
    content: '<p>Work was stressful today. Need to remember to take breaks and not let it get to me.</p>',
    mood: 'bad',
    date: '2025-11-25'
  },
]

const moods = [
  { value: 'great', label: 'Great', icon: IconMoodCrazyHappy, color: 'green' },
  { value: 'good', label: 'Good', icon: IconMoodHappy, color: 'teal' },
  { value: 'neutral', label: 'Neutral', icon: IconMoodEmpty, color: 'gray' },
  { value: 'bad', label: 'Bad', icon: IconMoodSad, color: 'orange' },
  { value: 'awful', label: 'Awful', icon: IconMoodSmile, color: 'red' },
]

export default function JournalComponent() {
  const [entries, setEntries] = useState(mockEntries)
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false)
  const [viewingEntry, setViewingEntry] = useState<typeof mockEntries[0] | null>(null)

  // New entry form state
  const [newEntryTitle, setNewEntryTitle] = useState('')
  const [newEntryMood, setNewEntryMood] = useState<string | null>('neutral')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Placeholder.configure({ placeholder: 'Write about your day...' }),
    ],
    content: '',
    immediatelyRender: false,
  })

  const getMoodIcon = (mood: string) => {
    const moodData = moods.find(m => m.value === mood)
    if (!moodData) return <IconMoodEmpty size="1rem" />
    const IconComponent = moodData.icon
    return <IconComponent size="1rem" />
  }

  const getMoodColor = (mood: string) => {
    const moodData = moods.find(m => m.value === mood)
    return moodData?.color || 'gray'
  }

  const handleAddEntry = () => {
    if (!newEntryTitle.trim() || !editor) return

    const newEntry = {
      id: Math.max(...entries.map(e => e.id), 0) + 1,
      title: newEntryTitle.trim(),
      content: editor.getHTML(),
      mood: newEntryMood || 'neutral',
      date: new Date().toISOString().split('T')[0]
    }

    setEntries([newEntry, ...entries])
    setNewEntryTitle('')
    setNewEntryMood('neutral')
    editor.commands.clearContent()
    closeAddModal()
  }

  const deleteEntry = (entryId: number) => {
    setEntries(entries.filter(entry => entry.id !== entryId))
    if (viewingEntry?.id === entryId) {
      closeViewModal()
    }
  }

  const viewEntry = (entry: typeof mockEntries[0]) => {
    setViewingEntry(entry)
    openViewModal()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getEntriesThisMonth = () => {
    const now = new Date()
    return entries.filter(e => {
      const entryDate = new Date(e.date)
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
    }).length
  }

  const getMoodCounts = () => {
    return moods.map(mood => ({
      ...mood,
      count: entries.filter(e => e.mood === mood.value).length
    }))
  }

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Journal
            </Title>
            <Text c="dimmed" size="sm">
              Record your thoughts, track your mood, and reflect on your days
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={openAddModal}
          >
            New Entry
          </Button>
        </Group>

        {/* Stats Cards */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Total Entries</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="pink">
                  <IconBook size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{entries.length}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>This Month</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                  <IconCalendar size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{getEntriesThisMonth()}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Current Streak</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconMoodHappy size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>3 days</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Avg Mood</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                  <IconMoodSmile size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>Good</Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Entries List */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <ThemeIcon size="lg" radius="md" variant="light" color="pink">
                    <IconBook size="1.2rem" />
                  </ThemeIcon>
                  <Title order={3} size="h4">Journal Entries</Title>
                </Group>
                <Badge variant="light">{entries.length} entries</Badge>
              </Group>

              <Divider mb="md" />

              {entries.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  No journal entries yet. Start writing to capture your thoughts!
                </Text>
              ) : (
                <Stack gap="md">
                  {entries.map(entry => (
                    <Card
                      key={entry.id}
                      withBorder
                      p="md"
                      radius="sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => viewEntry(entry)}
                    >
                      <Group justify="space-between" mb="xs">
                        <Group gap="sm">
                          <ThemeIcon size="sm" radius="xl" variant="light" color={getMoodColor(entry.mood)}>
                            {getMoodIcon(entry.mood)}
                          </ThemeIcon>
                          <Text size="sm" fw={600}>{entry.title}</Text>
                        </Group>
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            {formatDate(entry.date)}
                          </Text>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteEntry(entry.id)
                            }}
                          >
                            <IconTrash size="0.9rem" />
                          </ActionIcon>
                        </Group>
                      </Group>
                      <Text
                        size="sm"
                        c="dimmed"
                        lineClamp={2}
                        dangerouslySetInnerHTML={{
                          __html: entry.content.replace(/<[^>]*>/g, ' ').substring(0, 150) + '...'
                        }}
                      />
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Mood Overview */}
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Group gap="xs" mb="md">
                  <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                    <IconMoodSmile size="1.2rem" />
                  </ThemeIcon>
                  <Title order={4} size="h5">Mood Overview</Title>
                </Group>
                <Divider mb="md" />
                <Stack gap="xs">
                  {getMoodCounts().map(mood => {
                    const IconComponent = mood.icon
                    return (
                      <Group key={mood.value} justify="space-between">
                        <Group gap="xs">
                          <ThemeIcon size="sm" radius="xl" variant="light" color={mood.color}>
                            <IconComponent size="0.9rem" />
                          </ThemeIcon>
                          <Text size="sm">{mood.label}</Text>
                        </Group>
                        <Badge variant="light" color={mood.color}>
                          {mood.count}
                        </Badge>
                      </Group>
                    )
                  })}
                </Stack>
              </Card>

              {/* Quick Entry */}
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Group gap="xs" mb="md">
                  <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                    <IconEdit size="1.2rem" />
                  </ThemeIcon>
                  <Title order={4} size="h5">Quick Entry</Title>
                </Group>
                <Divider mb="md" />
                <Text size="sm" c="dimmed" mb="md">
                  How are you feeling today?
                </Text>
                <Group gap="xs" justify="center">
                  {moods.map(mood => {
                    const IconComponent = mood.icon
                    return (
                      <ActionIcon
                        key={mood.value}
                        size="xl"
                        radius="xl"
                        variant="light"
                        color={mood.color}
                        title={mood.label}
                        onClick={() => {
                          setNewEntryMood(mood.value)
                          openAddModal()
                        }}
                      >
                        <IconComponent size="1.5rem" />
                      </ActionIcon>
                    )
                  })}
                </Group>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Add Entry Modal */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="New Journal Entry"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Give your entry a title..."
            value={newEntryTitle}
            onChange={(e) => setNewEntryTitle(e.currentTarget.value)}
            required
          />

          <Select
            label="How are you feeling?"
            placeholder="Select your mood"
            data={moods.map(m => ({ value: m.value, label: m.label }))}
            value={newEntryMood}
            onChange={setNewEntryMood}
          />

          <div>
            <Text size="sm" fw={500} mb="xs">Entry</Text>
            <RichTextEditor editor={editor}>
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeAddModal}>Cancel</Button>
            <Button onClick={handleAddEntry}>Save Entry</Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Entry Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title={viewingEntry?.title || 'Journal Entry'}
        size="lg"
      >
        {viewingEntry && (
          <Stack gap="md">
            <Group gap="md">
              <Badge
                size="lg"
                variant="light"
                color={getMoodColor(viewingEntry.mood)}
                leftSection={getMoodIcon(viewingEntry.mood)}
              >
                {moods.find(m => m.value === viewingEntry.mood)?.label}
              </Badge>
              <Text size="sm" c="dimmed">
                {formatDate(viewingEntry.date)}
              </Text>
            </Group>

            <Divider />

            <Paper p="md" withBorder radius="sm">
              <div dangerouslySetInnerHTML={{ __html: viewingEntry.content }} />
            </Paper>

            <Group justify="flex-end">
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size="1rem" />}
                onClick={() => deleteEntry(viewingEntry.id)}
              >
                Delete
              </Button>
              <Button variant="light" onClick={closeViewModal}>Close</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
