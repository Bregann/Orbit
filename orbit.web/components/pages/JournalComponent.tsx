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
import { IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetJournalEntriesResponse, JournalEntry } from '@/interfaces/api/journal/GetJournalEntriesResponse'
import { JournalMoodEnum } from '@/interfaces/api/journal/JournalMoodEnum'
import JournalStatsCards from '@/components/journal/JournalStatsCards'
import JournalEntriesList from '@/components/journal/JournalEntriesList'
import JournalSidebarCards from '@/components/journal/JournalSidebarCards'
import AddJournalEntryModal from '@/components/journal/AddJournalEntryModal'
import ViewJournalEntryModal from '@/components/journal/ViewJournalEntryModal'

export default function JournalComponent() {
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false)
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null)
  const [initialMood, setInitialMood] = useState<JournalMoodEnum | undefined>(undefined)

  const { data: entriesData } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: async () => await doQueryGet<GetJournalEntriesResponse>('/api/journal/GetJournalEntries')
  })

  const entries = entriesData?.entries ?? []

  const handleViewEntry = (entry: JournalEntry) => {
    setViewingEntry(entry)
    openViewModal()
  }

  const handleQuickMoodClick = (mood: JournalMoodEnum) => {
    setInitialMood(mood)
    openAddModal()
  }

  const handleCloseAddModal = () => {
    setInitialMood(undefined)
    closeAddModal()
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
        <JournalStatsCards entries={entries} />

        {/* Entries List */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <JournalEntriesList entries={entries} onEntryClick={handleViewEntry} />
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <JournalSidebarCards entries={entries} onQuickMoodClick={handleQuickMoodClick} />
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Add Entry Modal */}
      <AddJournalEntryModal
        opened={addModalOpened}
        onClose={handleCloseAddModal}
        initialMood={initialMood}
      />

      {/* View Entry Modal */}
      <ViewJournalEntryModal
        opened={viewModalOpened}
        onClose={closeViewModal}
        entry={viewingEntry}
      />
    </Container>
  )
}
