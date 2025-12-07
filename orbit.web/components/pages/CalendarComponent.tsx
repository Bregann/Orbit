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
  Textarea,
  MultiSelect,
  Tabs,
  Paper,
  Box,
  SimpleGrid,
  ScrollArea
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconPlus,
  IconTrash,
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconPaperclip,
  IconFileText,
  IconCheck,
  IconX,
  IconMusic,
  IconPlane,
  IconHome,
  IconUsers,
  IconStethoscope,
  IconCar,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react'

// Mock documents from the documents section
const mockDocuments = [
  { id: 1, name: 'Concert Tickets - Coldplay.pdf', category: 'Tickets' },
  { id: 2, name: 'Flight Confirmation.pdf', category: 'Travel' },
  { id: 3, name: 'Hotel Booking.pdf', category: 'Travel' },
  { id: 4, name: 'Car Service Receipt.pdf', category: 'Vehicle' },
  { id: 5, name: 'Doctor Appointment Letter.pdf', category: 'Medical' },
]

// Mock events
const mockEvents = [
  {
    id: 1,
    title: 'Coldplay Concert',
    date: '2025-12-15',
    time: '19:30',
    location: 'Wembley Stadium, London',
    description: 'Coldplay Music of the Spheres World Tour',
    type: 'concert',
    attachments: [1],
    completed: false
  },
  {
    id: 2,
    title: 'Flight to Paris',
    date: '2025-12-20',
    time: '08:00',
    location: 'Heathrow Airport',
    description: 'Christmas holiday trip',
    type: 'travel',
    attachments: [2, 3],
    completed: false
  },
  {
    id: 3,
    title: 'Car MOT',
    date: '2025-12-10',
    time: '10:00',
    location: 'Kwik Fit, High Street',
    description: 'Annual MOT check',
    type: 'maintenance',
    attachments: [],
    completed: false
  },
  {
    id: 4,
    title: 'Birthday Party',
    date: '2025-11-28',
    time: '18:00',
    location: 'The Red Lion Pub',
    description: 'Sarah\'s 30th birthday celebration',
    type: 'social',
    attachments: [],
    completed: true
  },
  {
    id: 5,
    title: 'Doctor Appointment',
    date: '2025-11-25',
    time: '14:30',
    location: 'City Medical Centre',
    description: 'Annual checkup',
    type: 'medical',
    attachments: [5],
    completed: true
  },
]

const eventTypes = [
  { value: 'concert', label: 'Concert/Show', icon: IconMusic, color: 'pink' },
  { value: 'travel', label: 'Travel', icon: IconPlane, color: 'blue' },
  { value: 'social', label: 'Social', icon: IconUsers, color: 'violet' },
  { value: 'medical', label: 'Medical', icon: IconStethoscope, color: 'red' },
  { value: 'maintenance', label: 'Maintenance', icon: IconCar, color: 'orange' },
  { value: 'home', label: 'Home', icon: IconHome, color: 'teal' },
  { value: 'other', label: 'Other', icon: IconCalendarEvent, color: 'gray' },
]

export default function CalendarComponent() {
  const [events, setEvents] = useState(mockEvents)
  const [documents] = useState(mockDocuments)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [activeTab, setActiveTab] = useState<string | null>('upcoming')
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false)
  const [viewingEvent, setViewingEvent] = useState<typeof mockEvents[0] | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())

  // New event form state
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventTime, setNewEventTime] = useState('')
  const [newEventLocation, setNewEventLocation] = useState('')
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventType, setNewEventType] = useState<string | null>('other')
  const [newEventAttachments, setNewEventAttachments] = useState<string[]>([])

  const getEventTypeIcon = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type)
    if (!eventType) return <IconCalendarEvent size="1rem" />
    const IconComponent = eventType.icon
    return <IconComponent size="1rem" />
  }

  const getEventTypeColor = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type)
    return eventType?.color || 'gray'
  }

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !newEventDate) return

    const newEvent = {
      id: Math.max(...events.map(e => e.id), 0) + 1,
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime,
      location: newEventLocation.trim(),
      description: newEventDescription.trim(),
      type: newEventType || 'other',
      attachments: newEventAttachments.map(id => parseInt(id)),
      completed: false
    }

    setEvents([...events, newEvent])
    resetForm()
    closeAddModal()
  }

  const resetForm = () => {
    setNewEventTitle('')
    setNewEventDate('')
    setNewEventTime('')
    setNewEventLocation('')
    setNewEventDescription('')
    setNewEventType('other')
    setNewEventAttachments([])
  }

  const deleteEvent = (eventId: number) => {
    setEvents(events.filter(event => event.id !== eventId))
    if (viewingEvent?.id === eventId) {
      closeViewModal()
    }
  }

  const toggleEventCompleted = (eventId: number) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, completed: !event.completed } : event
    ))
  }

  const viewEvent = (event: typeof mockEvents[0]) => {
    setViewingEvent(event)
    openViewModal()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.date === dateStr)
  }

  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0]
    return events
      .filter(e => e.date >= today && !e.completed)
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  const getPastEvents = () => {
    const today = new Date().toISOString().split('T')[0]
    return events
      .filter(e => e.date < today || e.completed)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  const getEventsThisMonth = () => {
    const now = new Date()
    return events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
    }).length
  }

  const getDocumentById = (id: number) => {
    return documents.find(d => d.id === id)
  }

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    // Convert Sunday (0) to 6, Monday (1) to 0, etc. for Monday-first week
    return day === 0 ? 6 : day - 1
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days: (Date | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
    }

    // Fill remaining cells to complete the grid (always show 6 rows = 42 cells)
    while (days.length < 42) {
      days.push(null)
    }

    return days
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getMonthYearString = () => {
    return currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Calendar
            </Title>
            <Text c="dimmed" size="sm">
              Plan events, track tickets, and log places you&apos;ve been
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={openAddModal}
          >
            Add Event
          </Button>
        </Group>

        {/* Stats Cards */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Total Events</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                  <IconCalendarEvent size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{events.length}</Text>
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
              <Text size="xl" fw={700}>{getEventsThisMonth()}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Upcoming</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <IconClock size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{getUpcomingEvents().length}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Places Visited</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                  <IconMapPin size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{getPastEvents().length}</Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Main Content - Google Calendar Style */}
        <Grid gutter="md">
          {/* Large Calendar Grid */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Card withBorder p="md" radius="md" shadow="sm">
              {/* Calendar Header */}
              <Group justify="space-between" mb="md">
                <Group gap="sm">
                  <Button variant="light" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <ActionIcon variant="subtle" size="lg" onClick={() => navigateMonth('prev')}>
                    <IconChevronLeft size="1.2rem" />
                  </ActionIcon>
                  <ActionIcon variant="subtle" size="lg" onClick={() => navigateMonth('next')}>
                    <IconChevronRight size="1.2rem" />
                  </ActionIcon>
                  <Title order={3} size="h4">{getMonthYearString()}</Title>
                </Group>
              </Group>

              {/* Weekday Headers */}
              <SimpleGrid cols={7} spacing={0}>
                {weekDays.map(day => (
                  <Box key={day} py="xs" style={{ textAlign: 'center', borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                    <Text size="sm" fw={600} c="dimmed">{day}</Text>
                  </Box>
                ))}
              </SimpleGrid>

              {/* Calendar Days Grid */}
              <SimpleGrid cols={7} spacing={0}>
                {getCalendarDays().map((date, index) => {
                  const dayEvents = date ? getEventsForDate(date) : []
                  const isSelected = date && selectedDate?.toDateString() === date.toDateString()
                  const isTodayDate = date && isToday(date)

                  return (
                    <Box
                      key={index}
                      p="xs"
                      style={{
                        minHeight: 100,
                        borderRight: (index + 1) % 7 !== 0 ? '1px solid var(--mantine-color-dark-5)' : 'none',
                        borderBottom: index < 35 ? '1px solid var(--mantine-color-dark-5)' : 'none',
                        backgroundColor: isSelected ? 'var(--mantine-color-dark-6)' : 'transparent',
                        cursor: date ? 'pointer' : 'default',
                        opacity: date ? 1 : 0.3,
                      }}
                      onClick={() => date && setSelectedDate(date)}
                    >
                      {date && (
                        <>
                          <Group justify="flex-start" mb={4}>
                            <Text
                              size="sm"
                              fw={isTodayDate ? 700 : 500}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: isTodayDate ? 'var(--mantine-color-blue-6)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isTodayDate ? 'white' : undefined,
                              }}
                            >
                              {date.getDate()}
                            </Text>
                          </Group>
                          <Stack gap={2}>
                            {dayEvents.slice(0, 3).map(event => (
                              <Paper
                                key={event.id}
                                px={6}
                                py={2}
                                radius="sm"
                                style={{
                                  backgroundColor: `var(--mantine-color-${getEventTypeColor(event.type)}-9)`,
                                  cursor: 'pointer',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  viewEvent(event)
                                }}
                              >
                                <Text size="xs" lineClamp={1} c={getEventTypeColor(event.type)}>
                                  {event.time && `${event.time} `}{event.title}
                                </Text>
                              </Paper>
                            ))}
                            {dayEvents.length > 3 && (
                              <Text size="xs" c="dimmed" pl={6}>
                                +{dayEvents.length - 3} more
                              </Text>
                            )}
                          </Stack>
                        </>
                      )}
                    </Box>
                  )
                })}
              </SimpleGrid>
            </Card>
          </Grid.Col>

          {/* Events Sidebar */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder p="md" radius="md" shadow="sm" h="100%">
              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List mb="sm">
                  <Tabs.Tab value="upcoming" size="xs">
                    Upcoming
                  </Tabs.Tab>
                  <Tabs.Tab value="past" size="xs">
                    Past
                  </Tabs.Tab>
                </Tabs.List>

                <ScrollArea h={450} offsetScrollbars>
                  <Tabs.Panel value="upcoming">
                    {getUpcomingEvents().length === 0 ? (
                      <Text c="dimmed" ta="center" py="lg" size="sm">
                        No upcoming events
                      </Text>
                    ) : (
                      <Stack gap="xs">
                        {getUpcomingEvents().slice(0, 10).map(event => (
                          <Paper
                            key={event.id}
                            p="xs"
                            withBorder
                            radius="sm"
                            style={{ cursor: 'pointer' }}
                            onClick={() => viewEvent(event)}
                          >
                            <Group gap="xs" wrap="nowrap">
                              <ThemeIcon size="sm" radius="xl" variant="light" color={getEventTypeColor(event.type)}>
                                {getEventTypeIcon(event.type)}
                              </ThemeIcon>
                              <Stack gap={0} style={{ flex: 1 }}>
                                <Text size="xs" fw={600} lineClamp={1}>{event.title}</Text>
                                <Text size="xs" c="dimmed">
                                  {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  {event.time && ` · ${event.time}`}
                                </Text>
                              </Stack>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Tabs.Panel>

                  <Tabs.Panel value="past">
                    {getPastEvents().length === 0 ? (
                      <Text c="dimmed" ta="center" py="lg" size="sm">
                        No past events
                      </Text>
                    ) : (
                      <Stack gap="xs">
                        {getPastEvents().slice(0, 10).map(event => (
                          <Paper
                            key={event.id}
                            p="xs"
                            withBorder
                            radius="sm"
                            style={{ cursor: 'pointer', opacity: 0.8 }}
                            onClick={() => viewEvent(event)}
                          >
                            <Group gap="xs" wrap="nowrap">
                              <ThemeIcon size="sm" radius="xl" variant="light" color={getEventTypeColor(event.type)}>
                                {getEventTypeIcon(event.type)}
                              </ThemeIcon>
                              <Stack gap={0} style={{ flex: 1 }}>
                                <Text size="xs" fw={600} lineClamp={1}>{event.title}</Text>
                                <Group gap={4}>
                                  <Badge size="xs" variant="light" color="green">
                                    Attended
                                  </Badge>
                                  <Text size="xs" c="dimmed">
                                    {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  </Text>
                                </Group>
                              </Stack>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Tabs.Panel>
                </ScrollArea>
              </Tabs>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Add Event Modal */}
      <Modal
        opened={addModalOpened}
        onClose={() => {
          resetForm()
          closeAddModal()
        }}
        title="Add Event"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Event Title"
            placeholder="e.g., Coldplay Concert"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.currentTarget.value)}
            required
          />

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Date"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.currentTarget.value)}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Time"
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.currentTarget.value)}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Location"
            placeholder="e.g., Wembley Stadium, London"
            value={newEventLocation}
            onChange={(e) => setNewEventLocation(e.currentTarget.value)}
            leftSection={<IconMapPin size="1rem" />}
          />

          <Select
            label="Event Type"
            placeholder="Select type"
            data={eventTypes.map(t => ({ value: t.value, label: t.label }))}
            value={newEventType}
            onChange={setNewEventType}
          />

          <Textarea
            label="Description"
            placeholder="Add any notes about this event..."
            value={newEventDescription}
            onChange={(e) => setNewEventDescription(e.currentTarget.value)}
            rows={3}
          />

          <MultiSelect
            label="Attach Documents"
            placeholder="Link documents from your vault"
            description="Select tickets, confirmations, or other related documents"
            data={documents.map(d => ({ value: d.id.toString(), label: d.name }))}
            value={newEventAttachments}
            onChange={setNewEventAttachments}
            leftSection={<IconPaperclip size="1rem" />}
            searchable
            clearable
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => { resetForm(); closeAddModal() }}>Cancel</Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Event Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title={viewingEvent?.title || 'Event Details'}
        size="lg"
      >
        {viewingEvent && (
          <Stack gap="md">
            <Group gap="md">
              <Badge
                size="lg"
                variant="light"
                color={getEventTypeColor(viewingEvent.type)}
                leftSection={getEventTypeIcon(viewingEvent.type)}
              >
                {eventTypes.find(t => t.value === viewingEvent.type)?.label}
              </Badge>
              {viewingEvent.completed ? (
                <Badge size="lg" variant="light" color="green" leftSection={<IconCheck size="0.9rem" />}>
                  Attended
                </Badge>
              ) : (
                <Badge size="lg" variant="light" color="blue" leftSection={<IconClock size="0.9rem" />}>
                  Upcoming
                </Badge>
              )}
            </Group>

            <Divider />

            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="gray">
                  <IconCalendar size="0.9rem" />
                </ThemeIcon>
                <Text size="sm">{formatDate(viewingEvent.date)} {viewingEvent.time && `at ${viewingEvent.time}`}</Text>
              </Group>

              {viewingEvent.location && (
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="gray">
                    <IconMapPin size="0.9rem" />
                  </ThemeIcon>
                  <Text size="sm">{viewingEvent.location}</Text>
                </Group>
              )}
            </Stack>

            {viewingEvent.description && (
              <>
                <Divider />
                <div>
                  <Text size="sm" fw={500} mb="xs">Description</Text>
                  <Text size="sm" c="dimmed">{viewingEvent.description}</Text>
                </div>
              </>
            )}

            {viewingEvent.attachments.length > 0 && (
              <>
                <Divider />
                <div>
                  <Text size="sm" fw={500} mb="xs">Attached Documents</Text>
                  <Stack gap="xs">
                    {viewingEvent.attachments.map(attachmentId => {
                      const doc = getDocumentById(attachmentId)
                      if (!doc) return null
                      return (
                        <Paper key={attachmentId} p="xs" withBorder radius="sm">
                          <Group gap="xs">
                            <ThemeIcon size="sm" variant="light" color="blue">
                              <IconFileText size="0.9rem" />
                            </ThemeIcon>
                            <Text size="sm">{doc.name}</Text>
                          </Group>
                        </Paper>
                      )
                    })}
                  </Stack>
                </div>
              </>
            )}

            <Divider />

            <Group justify="space-between">
              <Button
                variant="light"
                color={viewingEvent.completed ? 'gray' : 'green'}
                leftSection={viewingEvent.completed ? <IconX size="1rem" /> : <IconCheck size="1rem" />}
                onClick={() => {
                  toggleEventCompleted(viewingEvent.id)
                  setViewingEvent({ ...viewingEvent, completed: !viewingEvent.completed })
                }}
              >
                {viewingEvent.completed ? 'Mark as Upcoming' : 'Mark as Attended'}
              </Button>
              <Group>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size="1rem" />}
                  onClick={() => deleteEvent(viewingEvent.id)}
                >
                  Delete
                </Button>
                <Button variant="light" onClick={closeViewModal}>Close</Button>
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
