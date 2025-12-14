'use client'

import { Grid, Card, Text, ThemeIcon, Group } from '@mantine/core'
import { IconBook, IconCalendar, IconMoodHappy, IconMoodSmile } from '@tabler/icons-react'
import type { JournalEntry } from '@/interfaces/api/journal/GetJournalEntriesResponse'

interface JournalStatsCardsProps {
  entries: JournalEntry[]
}

export default function JournalStatsCards({ entries }: JournalStatsCardsProps) {
  const getEntriesThisMonth = () => {
    const now = new Date()
    return entries.filter(e => {
      const entryDate = new Date(e.createdAt)
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
    }).length
  }

  const getAverageMood = () => {
    if (entries.length === 0) return 'N/A'
    const sum = entries.reduce((acc, entry) => acc + entry.mood, 0)
    const avg = sum / entries.length

    if (avg >= 3.5) return 'Great'
    if (avg >= 2.5) return 'Good'
    if (avg >= 1.5) return 'Neutral'
    if (avg >= 0.5) return 'Bad'
    return 'Awful'
  }

  // Simple streak calculation - count consecutive days with entries
  const getCurrentStreak = () => {
    if (entries.length === 0) return 0

    const sortedEntries = [...entries].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let currentDate = new Date(today)

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt)
      entryDate.setHours(0, 0, 0, 0)

      if (entryDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break
      }
    }

    return streak
  }

  return (
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
          <Text size="xl" fw={700}>{getCurrentStreak()} days</Text>
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
          <Text size="xl" fw={700}>{getAverageMood()}</Text>
        </Card>
      </Grid.Col>
    </Grid>
  )
}
