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
  IconMoodSmile,
  IconCalendar,
  IconNotes,
  IconTrendingUp,
  IconCalendarEvent
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'

export default function DashboardComponent() {
  const router = useRouter()

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
      title: 'Grocery List',
      description: 'Shopping items',
      icon: IconShoppingCart,
      color: 'orange',
      href: '/grocery'
    },
    {
      title: 'Journal',
      description: 'Mood & energy tracking',
      icon: IconMoodSmile,
      color: 'pink',
      href: '/journal'
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

  // Mock data - replace with real data later
  const todayTasks = [
    { id: 1, title: 'Review monthly budget', completed: false },
    { id: 2, title: 'Grocery shopping', completed: false },
    { id: 3, title: 'Call plumber', completed: true }
  ]

  const upcomingEvents = [
    { id: 1, title: 'Car maintenance', date: 'Nov 22', type: 'maintenance' },
    { id: 2, title: 'Dinner with friends', date: 'Nov 24', type: 'social' },
    { id: 3, title: 'Pay electricity bill', date: 'Nov 25', type: 'bill' }
  ]

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Title order={1} mb="lg">
        Dashboard
      </Title>

      {/* At a Glance Section */}
      <Stack gap="lg" mb="xl">
        <Title order={2} size="h3">At a Glance</Title>

        <Grid gutter="md">
          {/* Finance Summary */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" radius="md" color="green" variant="light">
                    <IconCash size="1rem" />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">This Month</Text>
                </Group>
                <Text size="xl" fw={700}>£2,450</Text>
                <Text size="xs" c="dimmed">Money Left</Text>
                <Group gap="xs">
                  <IconTrendingUp size="0.9rem" color="green" />
                  <Text size="xs" c="green">+12% from last month</Text>
                </Group>
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
                <Text size="xl" fw={700}>5/12</Text>
                <Text size="xs" c="dimmed">Tasks Completed</Text>
                <Progress value={42} size="sm" color="blue" />
              </Stack>
            </Card>
          </Grid.Col>

          {/* Mood Tracker */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <ThemeIcon size="md" radius="md" color="pink" variant="light">
                    <IconMoodSmile size="1rem" />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">This Week</Text>
                </Group>
                <Text size="xl" fw={700}>😊 Good</Text>
                <Text size="xs" c="dimmed">Average Mood</Text>
                <Text size="xs" c="dimmed">7 entries logged</Text>
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
                <Text size="xl" fw={700}>8</Text>
                <Text size="xs" c="dimmed">Events Scheduled</Text>
                <Text size="xs" c="orange" fw={500}>2 require attention</Text>
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
                <Badge color="blue" variant="light">3</Badge>
              </Group>
              <Divider />
              <Stack gap="sm">
                {todayTasks.map((task) => (
                  <Group key={task.id} justify="space-between">
                    <Group gap="xs">
                      <ThemeIcon
                        size="sm"
                        radius="xl"
                        variant={task.completed ? 'filled' : 'light'}
                        color={task.completed ? 'green' : 'gray'}
                      >
                        <IconCheckbox size="0.8rem" />
                      </ThemeIcon>
                      <Text
                        size="sm"
                        style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                        c={task.completed ? 'dimmed' : undefined}
                      >
                        {task.title}
                      </Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
              <Text
                size="sm"
                c="blue"
                style={{ cursor: 'pointer' }}
                ta="center"
                mt="xs"
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
                <Badge color="cyan" variant="light">{upcomingEvents.length}</Badge>
              </Group>
              <Divider />
              <Stack gap="sm">
                {upcomingEvents.map((event) => (
                  <Group key={event.id} justify="space-between">
                    <Group gap="xs">
                      <ThemeIcon size="sm" radius="md" variant="light" color="cyan">
                        <IconCalendarEvent size="0.8rem" />
                      </ThemeIcon>
                      <div>
                        <Text size="sm">{event.title}</Text>
                        <Text size="xs" c="dimmed">{event.date}</Text>
                      </div>
                    </Group>
                  </Group>
                ))}
              </Stack>
              <Text
                size="sm"
                c="cyan"
                style={{ cursor: 'pointer' }}
                ta="center"
                mt="xs"
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
                cursor: section.comingSoon === true ? 'default' : 'pointer',
                opacity: section.comingSoon === true ? 0.6 : 1,
                transition: 'transform 0.2s'
              }}
              onClick={() => section.comingSoon !== true && router.push(section.href)}
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
                {section.comingSoon === true && (
                  <Badge size="xs" variant="outline" color="gray">
                    Coming Soon
                  </Badge>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
