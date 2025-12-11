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
  ThemeIcon,
  ScrollArea,
  Menu
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState, useEffect } from 'react'
import {
  IconPlus,
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconCalendar,
  IconSettings
} from '@tabler/icons-react'
import { RRule } from 'rrule'
import type { CalendarEvent, CalendarEventType } from '@/interfaces/calendar/CalendarEvent'
import AddEventTypeModal from '@/components/calendars/AddEventTypeModal'
import AddEventModal from '@/components/calendars/AddEventModal'
import ViewEventModal from '@/components/calendars/ViewEventModal'
import EditEventModal from '@/components/calendars/EditEventModal'
import CalendarGrid from '@/components/calendars/CalendarGrid'
import EventsSidebar from '@/components/calendars/EventsSidebar'
import DayEventsModal from '@/components/calendars/DayEventsModal'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { GetCalendarEventsDto } from '@/interfaces/api/calendar/GetCalendarEventsDto'
import { GetCalendarEventTypesDto } from '@/interfaces/api/calendar/GetCalendarEventTypesDto'

export default function CalendarComponent() {
  const { data: calendarData } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: async () => await doQueryGet<GetCalendarEventsDto>('/api/calendar/GetCalendarEvents')
  })

  const { data: eventTypesData } = useQuery({
    queryKey: ['calendarEventTypes'],
    queryFn: async () => await doQueryGet<GetCalendarEventTypesDto>('/api/calendar/GetCalendarEventTypes')
  })

  const apiEvents: CalendarEvent[] = calendarData?.events.map(event => ({
    id: event.id,
    title: event.eventName,
    date: new Date(event.startTime).toISOString().split('T')[0],
    startTime: event.isAllDay ? undefined : new Date(event.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    endTime: event.isAllDay ? undefined : new Date(event.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    isAllDay: event.isAllDay,
    location: event.eventLocation,
    description: event.description || '',
    typeId: event.calendarEventTypeId.toString(),
    attachments: [],
    completed: false,
    rrule: event.recurrenceRule || undefined
  })) || []

  const apiEventTypes: CalendarEventType[] = eventTypesData?.eventTypes.map(type => ({
    id: type.id.toString(),
    label: type.eventTypeName,
    color: type.hexColourCode
  })) || []

  const [events, setEvents] = useState<CalendarEvent[]>(apiEvents)
  const [eventTypes, setEventTypes] = useState<CalendarEventType[]>(apiEventTypes)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [eventExceptions, setEventExceptions] = useState<Set<string>>(new Set()) // Set of "eventId_date" keys

  // Sync local state with API data when it changes
  useEffect(() => {
    if (calendarData?.events) {
      setEvents(apiEvents)
    }
  }, [calendarData])

  useEffect(() => {
    if (eventTypesData?.eventTypes) {
      setEventTypes(apiEventTypes)
    }
  }, [eventTypesData])

  // Sync event exceptions
  useEffect(() => {
    if (calendarData?.eventExceptions) {
      const exceptionsSet = new Set<string>()
      calendarData.eventExceptions.forEach(exception => {
        const exceptionDate = new Date(exception.exceptionDate).toISOString().split('T')[0]
        const key = `${exception.calendarEventId}_${exceptionDate}`
        exceptionsSet.add(key)
      })
      setEventExceptions(exceptionsSet)
    }
  }, [calendarData])

  const [activeTab, setActiveTab] = useState<string | null>('upcoming')
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [dayEventsModalOpened, { open: openDayEventsModal, close: closeDayEventsModal }] = useDisclosure(false)
  const [eventTypeModalOpened, { open: openEventTypeModal, close: closeEventTypeModal }] = useDisclosure(false)
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getEventTypeColor = (typeId: string) => {
    const eventType = eventTypes.find(t => t.id === typeId)
    return eventType?.color || '#6b7280'
  }

  const deleteEvent = (eventId: number) => {
    setEvents(events.filter(event => event.id !== eventId))
    if (viewingEvent?.id === eventId) {
      closeViewModal()
    }
  }

  const viewEvent = (event: CalendarEvent) => {
    setViewingEvent(event)
    openViewModal()
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    closeViewModal()
    openEditModal()
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const matchingEvents: CalendarEvent[] = []

    events.forEach(event => {
      // Check if this occurrence is in the exceptions list
      const exceptionKey = `${event.id}_${dateStr}`

      if (eventExceptions.has(exceptionKey)) {
        return // Skip this occurrence - it's been deleted
      }

      // Check if this is the event's base date
      if (event.date === dateStr) {
        matchingEvents.push(event)
      }
      // Check if this event has a recurrence rule and if this date matches
      else if (event.rrule) {
        try {
          // Parse the event's start date and create proper DTSTART
          const eventStartDate = new Date(event.date + 'T00:00:00Z')

          // Create RRule with proper DTSTART formatting
          const rruleString = `DTSTART:${eventStartDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nRRULE:${event.rrule}`
          const rule = RRule.fromString(rruleString)

          // Check if this date is in the recurrence set
          const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
          const occurrences = rule.between(
            new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), 0, 0, 0),
            new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), 23, 59, 59),
            true
          )

          if (occurrences.length > 0) {
            matchingEvents.push(event)
          }
        } catch (error) {
          console.error('Error parsing RRule for event:', event.title, error)
        }
      }
    })

    return matchingEvents
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter(e => {
        const eventDateTime = e.isAllDay
          ? new Date(e.date + 'T23:59:59')
          : new Date(e.date + 'T' + (e.endTime || '23:59') + ':00')
        return eventDateTime >= now
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  const getPastEvents = () => {
    const now = new Date()
    return events
      .filter(e => {
        const eventDateTime = e.isAllDay
          ? new Date(e.date + 'T23:59:59')
          : new Date(e.date + 'T' + (e.endTime || '23:59') + ':00')
        return eventDateTime < now
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  const getEventsThisMonth = () => {
    const now = new Date()
    return events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
    }).length
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
          <Group>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button variant="light" leftSection={<IconSettings size="1rem" />}>
                  Manage Types
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Event Types</Menu.Label>
                <Menu.Item
                  leftSection={<IconPlus size="1rem" />}
                  onClick={openEventTypeModal}
                >
                  Add New Type
                </Menu.Item>
                <Menu.Divider />
                <ScrollArea.Autosize mah={300}>
                  {eventTypes.map(type => (
                    <Menu.Item
                      key={type.id}
                      leftSection={
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: type.color,
                          }}
                        />
                      }
                    >
                      {type.label}
                    </Menu.Item>
                  ))}
                </ScrollArea.Autosize>
              </Menu.Dropdown>
            </Menu>
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={openAddModal}
            >
              Add Event
            </Button>
          </Group>
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

        {/* Main Content */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 9 }}>
            <CalendarGrid
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              events={events}
              onNavigateMonth={navigateMonth}
              onGoToToday={goToToday}
              onSelectDate={(date) => {
                setSelectedDate(date)
                openDayEventsModal()
              }}
              onViewEvent={viewEvent}
              getEventTypeColor={getEventTypeColor}
              getEventsForDate={getEventsForDate}
            />
          </Grid.Col>

          {/* Events Sidebar */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <EventsSidebar
              activeTab={activeTab}
              upcomingEvents={getUpcomingEvents()}
              pastEvents={getPastEvents()}
              onTabChange={setActiveTab}
              onViewEvent={viewEvent}
              getEventTypeColor={getEventTypeColor}
            />
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Add Event Modal */}
      <AddEventModal
        opened={addModalOpened}
        onClose={closeAddModal}
      />

      {/* View Event Modal */}
      <ViewEventModal
        opened={viewModalOpened}
        onClose={closeViewModal}
        event={viewingEvent}
        onDelete={deleteEvent}
        onEdit={handleEditEvent}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        opened={editModalOpened}
        onClose={closeEditModal}
        event={editingEvent}
      />

      {/* Add Event Type Modal */}
      <AddEventTypeModal
        opened={eventTypeModalOpened}
        onClose={closeEventTypeModal}
      />

      {/* Day Events Modal */}
      <DayEventsModal
        opened={dayEventsModalOpened}
        onClose={closeDayEventsModal}
        selectedDate={selectedDate}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
        onViewEvent={viewEvent}
        onAddEvent={openAddModal}
        getEventTypeColor={getEventTypeColor}
      />
    </Container>
  )
}
