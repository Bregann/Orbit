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
  IconTrendingDown
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetDashboardOverviewDataDto } from '@/interfaces/api/dashboard/GetDashboardOverviewDataDto'
import { getPriorityColour } from '@/helpers/dataHelper'

export default function DashboardComponent() {
  const router = useRouter()

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: async () => await doQueryGet<GetDashboardOverviewDataDto>('/api/Dashboard/GetDashboardOverviewData')
  })

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'No date'

    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)

    if (compareDate.getTime() === today.getTime()) {
      return 'Today'
    } else if (compareDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
    }
  }

  console.log('Dashboard Data:', dashboardData)

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

      {/* Today's Tasks & Upcoming Events */}
      <Grid gutter="md" mb="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3} size="h4">Today&apos;s Tasks</Title>
                <Badge color="blue" variant="light">{dashboardData.todaysTasks.length}</Badge>
              </Group>
              <Divider />
              {dashboardData.todaysTasks.length > 0 ? (
                <Stack gap="sm">
                  {dashboardData.todaysTasks.map((task) => (
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
                      {!task.isCompleted && (
                        <Badge size="xs" color={getPriorityColour(task.priority)} variant="light">
                          {task.priority === 2 ? 'High' : task.priority === 1 ? 'Med' : 'Low'}
                        </Badge>
                      )}
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
                <Title order={3} size="h4">Upcoming</Title>
                <Badge color="cyan" variant="light">{dashboardData.upcomingEvents.length}</Badge>
              </Group>
              <Divider />
              {dashboardData.upcomingEvents.length > 0 ? (
                <Stack gap="sm">
                  {dashboardData.upcomingEvents.map((event) => (
                    <Group key={event.eventId} justify="space-between">
                      <Group gap="xs">
                        <ThemeIcon size="sm" radius="md" variant="light" color="cyan">
                          <IconCalendarEvent size="0.8rem" />
                        </ThemeIcon>
                        <div>
                          <Text size="sm">{event.eventTitle}</Text>
                          <Text size="xs" c="dimmed">{formatDate(event.eventDate)}</Text>
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
    </Container>
  )
}
