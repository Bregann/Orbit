'use client'

import { Stack, Card, Title, Badge, Divider, ThemeIcon, Group, Text, ActionIcon } from '@mantine/core'
import { IconMoodSmile, IconEdit } from '@tabler/icons-react'
import { moods } from './JournalEntriesList'
import type { JournalEntry } from '@/interfaces/api/journal/GetJournalEntriesResponse'
import { JournalMoodEnum } from '@/interfaces/api/journal/JournalMoodEnum'

interface JournalSidebarCardsProps {
  entries: JournalEntry[]
  onQuickMoodClick: (_mood: JournalMoodEnum) => void
}

export default function JournalSidebarCards({ entries, onQuickMoodClick }: JournalSidebarCardsProps) {
  const getMoodCounts = () => {
    return moods.map(mood => ({
      ...mood,
      count: entries.filter(e => e.mood === mood.value).length
    }))
  }

  return (
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
                onClick={() => onQuickMoodClick(mood.value)}
              >
                <IconComponent size="1.5rem" />
              </ActionIcon>
            )
          })}
        </Group>
      </Card>
    </Stack>
  )
}
