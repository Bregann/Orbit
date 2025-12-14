'use client'

import { Grid, Card, Text, ThemeIcon, Group } from '@mantine/core'
import { IconNote, IconStar, IconFolder, IconFile } from '@tabler/icons-react'
import type { NotePage, NoteFolder } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse'

interface NotesStatsCardsProps {
  pages: NotePage[]
  folders: NoteFolder[]
}

export default function NotesStatsCards({ pages, folders }: NotesStatsCardsProps) {
  const favouriteCount = pages.filter(p => p.isFavourite).length
  const unfiledCount = pages.filter(p => p.folderId === null).length

  return (
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
            <Text size="sm" c="dimmed" fw={500}>Favourites</Text>
            <ThemeIcon size="lg" radius="md" variant="light" color="yellow">
              <IconStar size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{favouriteCount}</Text>
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
          <Text size="xl" fw={700}>{unfiledCount}</Text>
        </Card>
      </Grid.Col>
    </Grid>
  )
}
