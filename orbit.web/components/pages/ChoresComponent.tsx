'use client'

import { useState } from 'react'
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
  Divider,
  ThemeIcon,
  Loader,
  Center
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconPlus,
  IconCheck,
  IconX,
  IconHome,
  IconRepeat,
  IconClock,
  IconAlertTriangle,
  IconCalendarEvent,
  IconArrowRight
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPatch } from '@/helpers/mutations/useMutationPatch'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import type { GetChoresResponse } from '@/interfaces/api/chores/GetChoresResponse'
import type { ChoreItem } from '@/interfaces/api/chores/ChoreItem'
import { ChoreFrequencyType } from '@/interfaces/api/chores/ChoreFrequencyType'
import { isOverdue, isToday, formatRelativeDate } from '@/helpers/dateHelper'
import { getFrequencyLabel, getFrequencyColour } from '@/helpers/choreHelper'
import AddChoreModal from '@/components/chores/AddChoreModal'
import EditChoreModal from '@/components/chores/EditChoreModal'
import ChoreCard from '@/components/chores/ChoreCard'
import { QueryKeys } from '@/helpers/QueryKeys'

export default function ChoresComponent() {
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [editChore, setEditChore] = useState<ChoreItem | null>(null)

  const { data: choresData, isLoading } = useQuery({
    queryKey: [QueryKeys.Chores],
    queryFn: async () => await doQueryGet<GetChoresResponse>('/api/chores/GetChores')
  })

  const chores = choresData?.chores ?? []

  const { mutate: deleteChore, isPending: isDeleting } = useMutationDelete<number, void>({
    url: (choreId) => `/api/chores/DeleteChore?choreId=${choreId}`,
    queryKey: [QueryKeys.Chores],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Chore deleted successfully', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete chore', 3000, <IconX />)
    }
  })

  const { mutate: completeChore, isPending: isCompleting } = useMutationPatch<number, void>({
    url: (choreId) => `/api/chores/CompleteChore?choreId=${choreId}`,
    queryKey: [QueryKeys.Chores],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Chore completed! Next due date has been set.', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to complete chore', 3000, <IconX />)
    }
  })

  const isPending = isCompleting || isDeleting
  const overdueChores = chores.filter(c => isOverdue(c.nextDueDate))
  const upcomingChores = chores.filter(c => !isOverdue(c.nextDueDate))
  const dueToday = chores.filter(c => isToday(c.nextDueDate))

  if (isLoading) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Chores
            </Title>
            <Text c="dimmed" size="sm">
              Track recurring household tasks and stay on top of your cleaning schedule
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={openAddModal}
          >
            Add Chore
          </Button>
        </Group>

        {/* Stats Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Total Chores</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <IconHome size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{chores.length}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Due Today</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconClock size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{dueToday.length}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Overdue</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="red">
                  <IconAlertTriangle size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c={overdueChores.length > 0 ? 'red' : undefined}>
                {overdueChores.length}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Upcoming</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                  <IconRepeat size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{upcomingChores.length}</Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Upcoming Schedule — at-a-glance forecast */}
        {chores.length > 0 && (
          <Card withBorder p="lg" radius="md" shadow="sm">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                  <IconCalendarEvent size="1.2rem" />
                </ThemeIcon>
                <Title order={3} size="h4">Upcoming Schedule</Title>
              </Group>
            </Group>
            <Divider mb="md" />
            <Grid>
              {chores
                .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
                .map(chore => {
                  const due = new Date(chore.nextDueDate)
                  const freq = chore.frequency
                  // Compute next 3 occurrences for the forecast
                  const occurrences: Date[] = [due]
                  for (let i = 1; i < 3; i++) {
                    const prev = occurrences[i - 1]
                    let next: Date
                    if (freq === ChoreFrequencyType.Daily) { next = new Date(prev); next.setDate(prev.getDate() + 1) }
                    else if (freq === ChoreFrequencyType.Weekly) { next = new Date(prev); next.setDate(prev.getDate() + 7) }
                    else if (freq === ChoreFrequencyType.Biweekly) { next = new Date(prev); next.setDate(prev.getDate() + 14) }
                    else if (freq === ChoreFrequencyType.Monthly) { next = new Date(prev); next.setMonth(prev.getMonth() + 1) }
                    else if (freq === ChoreFrequencyType.SixMonthly) { next = new Date(prev); next.setMonth(prev.getMonth() + 6) }
                    else { next = new Date(prev); next.setDate(prev.getDate() + (chore.customFrequencyDays ?? 7)) }
                    occurrences.push(next)
                  }

                  const overdue = isOverdue(chore.nextDueDate)

                  return (
                    <Grid.Col key={chore.id} span={{ base: 12, xs: 6, md: 4, lg: 3 }}>
                      <Card withBorder p="sm" radius="sm">
                        <Stack gap={4}>
                          <Group gap="xs" wrap="nowrap">
                            <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1 }}>
                              {chore.name}
                            </Text>
                            <Badge size="xs" variant="light" color={getFrequencyColour(chore.frequency)}>
                              {getFrequencyLabel(chore.frequency)}
                            </Badge>
                          </Group>
                          <Group gap="xs">
                            <Text size="xs" c={overdue ? 'red' : 'dimmed'} fw={overdue ? 600 : 400}>
                              {overdue ? '⚠ ' : ''}{formatRelativeDate(chore.nextDueDate)}
                            </Text>
                            <IconArrowRight size="0.6rem" style={{ color: 'var(--mantine-color-dimmed)' }} />
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {occurrences.slice(1).map(d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })).join(', ')}
                            </Text>
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  )
                })}
            </Grid>
          </Card>
        )}

        {/* Chore List */}
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                <IconHome size="1.2rem" />
              </ThemeIcon>
              <Title order={3} size="h4">All Chores</Title>
            </Group>
            <Badge variant="light">{chores.length} chores</Badge>
          </Group>

          <Divider mb="md" />

          {chores.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No chores yet. Add your first recurring household task to get started!
            </Text>
          ) : (
            <Stack gap="md">
              {overdueChores.length > 0 && (
                <>
                  <Text size="sm" fw={600} c="red" tt="uppercase">
                    Overdue ({overdueChores.length})
                  </Text>
                  {overdueChores.map(chore => (
                    <ChoreCard
                      key={chore.id}
                      chore={chore}
                      onComplete={completeChore}
                      onEdit={setEditChore}
                      onDelete={deleteChore}
                      isPending={isPending}
                    />
                  ))}
                </>
              )}

              {upcomingChores.length > 0 && (
                <>
                  <Text size="sm" fw={600} c="dimmed" tt="uppercase" mt={overdueChores.length > 0 ? 'md' : undefined}>
                    Upcoming ({upcomingChores.length})
                  </Text>
                  {upcomingChores.map(chore => (
                    <ChoreCard
                      key={chore.id}
                      chore={chore}
                      onComplete={completeChore}
                      onEdit={setEditChore}
                      onDelete={deleteChore}
                      isPending={isPending}
                    />
                  ))}
                </>
              )}
            </Stack>
          )}
        </Card>
      </Stack>

      <AddChoreModal
        opened={addModalOpened}
        onClose={closeAddModal}
      />

      <EditChoreModal
        opened={editChore !== null}
        chore={editChore}
        onClose={() => setEditChore(null)}
      />
    </Container>
  )
}
