'use client'

import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Badge,
  Progress,
  Divider,
  SimpleGrid
} from '@mantine/core'
import {
  IconCash,
  IconCheckbox,
  IconFiles,
  IconShoppingCart,
  IconCalendar,
  IconNotes,
  IconCalendarEvent,
  IconTrendingDown,
  IconMoodSmile,
  IconNotebook
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetDashboardOverviewDataDto } from '@/interfaces/api/dashboard/GetDashboardOverviewDataDto'
import { getPriorityColour, getPriorityLabel } from '@/helpers/dataHelper'
import { formatRelativeDate, formatDateWithTime } from '@/helpers/dateHelper'
import { GetCalendarEventsDto, type EventEntry } from '@/interfaces/api/calendar/GetCalendarEventsDto'
import ViewEventModal from '@/components/calendars/ViewEventModal'
import { QueryKeys } from '@/helpers/QueryKeys'
import MoodSelector from '@/components/mood/MoodSelector'
import type { GetTodaysMoodResponse } from '@/interfaces/api/mood/GetTodaysMoodResponse'

export default function DashboardComponent() {
  const router = useRouter()
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false)
  const [viewingEvent, setViewingEvent] = useState<EventEntry | null>(null)

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [QueryKeys.DashboardOverview],
    queryFn: async () => await doQueryGet<GetDashboardOverviewDataDto>('/api/Dashboard/GetDashboardOverviewData')
  })

  const { data: calendarData } = useQuery({
    queryKey: [QueryKeys.CalendarEvents],
    queryFn: async () => await doQueryGet<GetCalendarEventsDto>('/api/calendar/GetCalendarEvents')
  })

  const { data: moodData } = useQuery({
    queryKey: [QueryKeys.TodaysMood],
    queryFn: async () => await doQueryGet<GetTodaysMoodResponse>('/api/Mood/GetTodaysMood')
  })

  const handleEventClick = (eventId: number) => {
    const calendarEvent = calendarData?.events.find(e => e.id === eventId)
    if (calendarEvent) {
      setViewingEvent(calendarEvent)
      openViewModal()
    }
  }

  const handleDeleteEvent = () => {
    closeViewModal()
  }

  // Quick access sections
  const sections = [
    {
      title: 'Finance',
      description: 'Income, expenses & savings',
      icon: IconCash,
      color: 'green',
      href: '/finance'
    },
    {
      title: 'Tasks',
      description: 'To-do lists & reminders',
      icon: IconCheckbox,
      color: 'blue',
      href: '/tasks'
    },
    {
      title: 'Documents',
      description: 'Personal vault',
      icon: IconFiles,
      color: 'violet',
      href: '/documents'
    },
    {
      title: 'Shopping List',
      description: 'Shopping items',
      icon: IconShoppingCart,
      color: 'orange',
      href: '/shopping'
    },
    {
      title: 'Journal',
      description: 'Daily thoughts & reflections',
      icon: IconNotebook,
      color: 'pink',
      href: '/journal'
    },
    {
      title: 'Mood Tracker',
      description: 'Track your daily mood',
      icon: IconMoodSmile,
      color: 'teal',
      href: '/mood'
    },
    {
      title: 'Calendar',
      description: 'Chores, maintenance & events',
      icon: IconCalendar,
      color: 'cyan',
      href: '/calendar'
    },
    {
      title: 'Notes',
      description: 'General notes & ideas',
      icon: IconNotes,
      color: 'gray',
      href: '/notes'
    }
  ]

  if (isLoading || !dashboardData) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Title order={1} mb="lg">
          Dashboard
        </Title>
        <Text c="dimmed">Loading...</Text>
      </Container>
    )
  }

  const tasksCompletionPercentage = dashboardData.totalTasks > 0
    ? Math.round((dashboardData.tasksCompleted / dashboardData.totalTasks) * 100)
    : 0

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Title order={1} mb="lg">
        Dashboard
      </Title>

      {/* At a Glance Section */}
      <Stack gap="lg" mb="xl">
        <Title order={2} size="h3">At a Glance</Title>

        <Grid gutter="md">
          {/* Money Left */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" radius="md" color="green" variant="light">
                    <IconCash size="1rem" />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">This Month</Text>
                </Group>
                <Text size="xl" fw={700}>{dashboardData.moneyLeft}</Text>
                <Text size="xs" c="dimmed">Money Left</Text>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Money Spent */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" radius="md" color="red" variant="light">
                    <IconTrendingDown size="1rem" />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">This Month</Text>
                </Group>
                <Text size="xl" fw={700}>{dashboardData.moneySpent}</Text>
                <Text size="xs" c="dimmed">Money Spent</Text>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Tasks Summary */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" radius="md" color="blue" variant="light">
                    <IconCheckbox size="1rem" />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">Today</Text>
                </Group>
                <Text size="xl" fw={700}>{dashboardData.tasksCompleted}/{dashboardData.totalTasks}</Text>
                <Text size="xs" c="dimmed">Tasks Completed</Text>
                <Progress value={tasksCompletionPercentage} size="sm" color="blue" />
              </Stack>
            </Card>
          </Grid.Col>

          {/* Upcoming Events */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" radius="md" color="cyan" variant="light">
                    <IconCalendarEvent size="1rem" />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">Next 7 Days</Text>
                </Group>
                <Text size="xl" fw={700}>{dashboardData.eventsScheduled}</Text>
                <Text size="xs" c="dimmed">Events Scheduled</Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Mood Selector */}
      <Stack gap="lg" mb="xl">
        <MoodSelector
          currentMood={moodData?.mood ?? null}
          hasMoodToday={moodData?.hasMoodToday ?? false}
        />
      </Stack>

      {/* Today's Tasks & Upcoming Events */}
      <Grid gutter="md" mb="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3} size="h4">Upcoming Tasks</Title>
                <Badge color="blue" variant="light">{dashboardData.upcomingTasks.length}</Badge>
              </Group>
              <Divider />
              {dashboardData.upcomingTasks.length > 0 ? (
                <Stack gap="sm">
                  {dashboardData.upcomingTasks.map((task) => (
                    <Group key={task.taskId} justify="space-between">
                      <Group gap="xs">
                        <ThemeIcon
                          size="sm"
                          radius="xl"
                          variant={task.isCompleted ? 'filled' : 'light'}
                          color={task.isCompleted ? 'green' : getPriorityColour(task.priority)}
                        >
                          <IconCheckbox size="0.8rem" />
                        </ThemeIcon>
                        <Text
                          size="sm"
                          style={{ textDecoration: task.isCompleted ? 'line-through' : 'none' }}
                          c={task.isCompleted ? 'dimmed' : undefined}
                        >
                          {task.taskTitle}
                        </Text>
                      </Group>
                      <Stack gap={4} align="flex-end">
                        {!task.isCompleted && (
                          <Badge size="xs" color={getPriorityColour(task.priority)} variant="light">
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        )}
                        {task.dueDate && (
                          <Text size="xs" c="dimmed">
                            {formatRelativeDate(task.dueDate)}
                          </Text>
                        )}
                      </Stack>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed" ta="center">No tasks for today</Text>
              )}
              <Text
                size="sm"
                c="blue"
                style={{ cursor: 'pointer' }}
                ta="center"
                mt="xs"
                onClick={() => router.push('/tasks')}
              >
                View All Tasks →
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3} size="h4">Upcoming Events</Title>
                <Badge color="cyan" variant="light">{dashboardData.upcomingEvents.length}</Badge>
              </Group>
              <Divider />
              {dashboardData.upcomingEvents.length > 0 ? (
                <Stack gap="sm">
                  {dashboardData.upcomingEvents.map((event) => (
                    <Group
                      key={event.eventId}
                      justify="space-between"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleEventClick(event.eventId)}
                    >
                      <Group gap="xs">
                        <ThemeIcon size="sm" radius="md" variant="light" color="cyan">
                          <IconCalendarEvent size="0.8rem" />
                        </ThemeIcon>
                        <div>
                          <Text size="sm">{event.eventTitle}</Text>
                          <Text size="xs" c="dimmed">
                            {event.isAllDay
                              ? `${new Date(event.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (All day)`
                              : formatDateWithTime(
                                event.eventDate.split('T')[0],
                                new Date(event.eventDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                                false
                              )
                            }
                          </Text>
                        </div>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed" ta="center">No upcoming events</Text>
              )}
              <Text
                size="sm"
                c="cyan"
                style={{ cursor: 'pointer' }}
                ta="center"
                mt="xs"
                onClick={() => router.push('/calendar')}
              >
                View Calendar →
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Quick Access to All Sections */}
      <Stack gap="lg">
        <Title order={2} size="h3">Quick Access</Title>
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
          {sections.map((section) => (
            <Card
              key={section.title}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                cursor: 'pointer',
                opacity: 1,
                transition: 'transform 0.2s'
              }}
              onClick={() => router.push(section.href)}
              className="hover-card"
            >
              <Stack gap="sm" align="center" ta="center">
                <ThemeIcon size={50} radius="md" color={section.color} variant="light">
                  <section.icon size="1.8rem" />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="sm">
                    {section.title}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {section.description}
                  </Text>
                </div>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      <ViewEventModal
        opened={viewModalOpened}
        onClose={closeViewModal}
        event={viewingEvent}
        onDelete={handleDeleteEvent}
      />
    </Container>
  )
}
