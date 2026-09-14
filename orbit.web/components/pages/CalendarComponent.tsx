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
import { useState, useMemo } from 'react'
import {
  IconPlus,
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconCalendar,
  IconSettings
} from '@tabler/icons-react'
import { RRule } from 'rrule'
import type { EventEntry } from '@/interfaces/api/calendar/GetCalendarEventsDto'
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
import { getEventTypeColour } from '@/helpers/dataHelper'
import { toDateString, toApiDateString } from '@/helpers/dateHelper'
import { QueryKeys } from '@/helpers/QueryKeys'

export default function CalendarComponent() {
  const { data: calendarData, isLoading: isLoadingEvents } = useQuery({
    queryKey: [QueryKeys.CalendarEvents],
    queryFn: async () => await doQueryGet<GetCalendarEventsDto>('/api/calendar/GetCalendarEvents')
  })

  const { data: eventTypesData, isLoading: isLoadingEventTypes } = useQuery({
    queryKey: [QueryKeys.CalendarEventTypes],
    queryFn: async () => await doQueryGet<GetCalendarEventTypesDto>('/api/calendar/GetCalendarEventTypes')
  })

  const events = calendarData?.events || []
  const eventTypes = eventTypesData?.eventTypes || []

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  // Build event exceptions set from API data
  const eventExceptions = useMemo(() => {
    const exceptionsSet = new Set<string>()
    calendarData?.eventExceptions?.forEach(exception => {
      // Take the date portion verbatim; parsing would shift it by a day for
      // viewers ahead of UTC and the exception would stop matching.
      const exceptionDate = toApiDateString(exception.exceptionDate)
      const key = `${exception.calendarEventId}_${exceptionDate}`
      exceptionsSet.add(key)
    })
    return exceptionsSet
  }, [calendarData?.eventExceptions])

  const [activeTab, setActiveTab] = useState<string | null>('upcoming')
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [dayEventsModalOpened, { open: openDayEventsModal, close: closeDayEventsModal }] = useDisclosure(false)
  const [eventTypeModalOpened, { open: openEventTypeModal, close: closeEventTypeModal }] = useDisclosure(false)
  const [viewingEvent, setViewingEvent] = useState<EventEntry | null>(null)
  const [editingEvent, setEditingEvent] = useState<EventEntry | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())

  const deleteEvent = (eventId: number) => {
    // Event will be removed via query invalidation
    if (viewingEvent?.id === eventId) {
      closeViewModal()
    }
  }

  const viewEvent = (event: EventEntry) => {
    setViewingEvent(event)
    openViewModal()
  }

  const handleEditEvent = (event: EventEntry) => {
    setEditingEvent(event)
    closeViewModal()
    openEditModal()
  }

  const getEventsForDate = (date: Date) => {
    // Format date as YYYY-MM-DD without timezone conversion
    const dateStr = toDateString(date)
    const matchingEvents: EventEntry[] = []

    events.forEach(event => {
      // Check if this occurrence is in the exceptions list
      const exceptionKey = `${event.id}_${dateStr}`

      if (eventExceptions.has(exceptionKey)) {
        return // Skip this occurrence - it's been deleted
      }

      // Get event start date from API format
      const eventStartDate = toApiDateString(event.startTime)

      // Check if this is the event's base date
      if (eventStartDate === dateStr) {
        matchingEvents.push(event)
      }
      // Check if this event has a recurrence rule and if this date matches
      else if (event.recurrenceRule) {
        try {
          // Treat recurrences as wall-clock dates: anchor DTSTART at UTC
          // midnight and query with UTC bounds. Mixing a UTC DTSTART with
          // local-midnight bounds (as before) shifts occurrences by a day.
          const rruleString = `DTSTART:${eventStartDate.replace(/-/g, '')}T000000Z\nRRULE:${event.recurrenceRule}`
          const rule = RRule.fromString(rruleString)

          const occurrences = rule.between(
            new Date(`${dateStr}T00:00:00Z`),
            new Date(`${dateStr}T23:59:59Z`),
            true
          )

          if (occurrences.length > 0) {
            matchingEvents.push(event)
          }
        } catch (error) {
          console.error('Error parsing RRule for event:', event.eventName, error)
        }
      }
    })

    return matchingEvents
  }

  // An all-day event is "upcoming" for the whole of its final day, so compare
  // on the calendar date rather than an instant.
  const hasPassed = (event: EventEntry) => {
    if (event.isAllDay) {
      return toApiDateString(event.endTime) < toDateString(new Date())
    }
    return new Date(event.endTime) < new Date()
  }

  const getUpcomingEvents = () => {
    return events
      .filter(e => !hasPassed(e))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const getPastEvents = () => {
    return events
      .filter(e => hasPassed(e))
      .sort((a, b) => b.startTime.localeCompare(a.startTime))
  }

  const getEventsThisMonth = () => {
    const now = new Date()
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return events.filter(e => toApiDateString(e.startTime).startsWith(prefix)).length
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

  if (isLoadingEvents || isLoadingEventTypes) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Stack gap="xl" align="center" justify="center" style={{ minHeight: '60vh' }}>
          <Text>Loading calendar...</Text>
        </Stack>
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
                            backgroundColor: type.hexColourCode,
                          }}
                        />
                      }
                    >
                      {type.eventTypeName}
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
        <Grid>
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
        <Grid>
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
              getEventTypeColour={(typeId) => getEventTypeColour(typeId, eventTypes)}
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
              getEventTypeColour={(typeId) => getEventTypeColour(typeId, eventTypes)}
            />
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Add Event Modal */}
      <AddEventModal
        opened={addModalOpened}
        onClose={closeAddModal}
        initialDate={selectedDate}
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
        getEventTypeColour={(typeId) => getEventTypeColour(typeId, eventTypes)}
      />
    </Container>
  )
}
